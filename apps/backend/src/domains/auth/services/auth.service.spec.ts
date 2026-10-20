import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CryptoService } from '@omnistay/security';
import { TotpService } from '@omnistay/security';
import bcrypt from 'bcryptjs';

describe('AuthService Core Authentication Suite', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;
  let cryptoService: CryptoService;
  let totpService: TotpService;
  let mockRateLimiter: any;
  let mockRedis: any;
  let mockQueueProducer: any;

  beforeEach(() => {
    cryptoService = new CryptoService();
    totpService = new TotpService();

    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
      refreshToken: {
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };

    mockJwtService = {
      sign: vi.fn().mockReturnValue('mock_signed_jwt'),
      verify: vi.fn(),
    };

    mockRateLimiter = {
      consume: vi.fn().mockResolvedValue(undefined),
      reset: vi.fn().mockResolvedValue(undefined),
    };

    mockRedis = {
      isReady: vi.fn().mockReturnValue(false),
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    };

    mockQueueProducer = {
      sendPasswordResetEmail: vi.fn().mockResolvedValue({ id: 'job-1' }),
      sendTwoFactorAlert: vi.fn().mockResolvedValue({ id: 'job-2' }),
    };

    authService = new AuthService(
      mockPrisma,
      mockJwtService,
      cryptoService,
      totpService,
      mockRateLimiter,
      mockRedis,
      mockQueueProducer,
    );
  });

  describe('login()', () => {
    it('should authenticate non-2FA user directly and return full session', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass123!', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-regular',
        email: 'regular@example.com',
        name: 'Regular User',
        passwordHash,
        status: 'ACTIVE',
        isTwoFactorEnabled: false,
        memberships: [
          {
            organization: { id: 'org-1', name: 'Org 1' },
            role: { name: 'Front Desk Agent', permissions: ['rooms:read'] },
          },
        ],
      });

      const result: any = await authService.login(
        { email: 'regular@example.com', password: 'CorrectPass123!' },
        '127.0.0.1',
      );

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.requires2fa).toBeUndefined();
    });

    it('should challenge user with mandatory 2FA role and issue tempToken', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass123!', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-admin',
        email: 'superadmin@example.com',
        name: 'Super Admin',
        passwordHash,
        status: 'ACTIVE',
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
        memberships: [
          {
            organization: { id: 'org-1', name: 'Org 1' },
            role: { name: 'SuperAdmin', permissions: ['*'] },
          },
        ],
      });

      const result: any = await authService.login(
        { email: 'superadmin@example.com', password: 'CorrectPass123!' },
        '127.0.0.1',
      );

      expect(result.requires2fa).toBe(true);
      expect(result.tempToken).toBeDefined();
      expect(result.enrollmentRequired).toBe(true);
      expect(result.secret).toBeDefined();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass123!', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-1',
        email: 'user@example.com',
        passwordHash,
        status: 'ACTIVE',
      });

      await expect(
        authService.login({ email: 'user@example.com', password: 'WrongPassword' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user status is not ACTIVE', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-suspended',
        email: 'suspended@example.com',
        status: 'SUSPENDED',
      });

      await expect(
        authService.login({ email: 'suspended@example.com', password: 'AnyPassword' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('setup2fa()', () => {
    it('should generate 2FA secret and recovery codes for user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-setup',
        email: 'setup@example.com',
      });

      const res = await authService.setup2fa('usr-setup');

      expect(res.secret).toBeDefined();
      expect(res.otpAuthUri).toContain('setup%40example.com');
      expect(res.recoveryCodes).toHaveLength(8);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'usr-setup' },
          data: expect.objectContaining({
            isTwoFactorEnabled: false,
            twoFactorRecoveryCodes: expect.any(Array),
          }),
        }),
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.setup2fa('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirm2faEnrollment()', () => {
    it('should confirm 2FA when valid 6-digit TOTP code is provided', async () => {
      const plainSecret = totpService.generateSecret();
      const encryptedSecret = cryptoService.encrypt(plainSecret);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-confirm',
        twoFactorSecret: encryptedSecret,
      });

      const validCode = totpService.generateToken(plainSecret);
      const res = await authService.confirm2faEnrollment('usr-confirm', validCode);

      expect(res.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'usr-confirm' },
          data: expect.objectContaining({
            isTwoFactorEnabled: true,
          }),
        }),
      );
    });

    it('should throw BadRequestException when code is invalid', async () => {
      const plainSecret = totpService.generateSecret();
      const encryptedSecret = cryptoService.encrypt(plainSecret);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-confirm',
        twoFactorSecret: encryptedSecret,
      });

      await expect(
        authService.confirm2faEnrollment('usr-confirm', '000000'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('disable2fa()', () => {
    it('should forbid disabling 2FA for mandatory role (e.g. SuperAdmin)', async () => {
      const passwordHash = await bcrypt.hash('Pass', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-owner',
        passwordHash,
        memberships: [{ role: { name: 'SuperAdmin' } }],
      });

      await expect(
        authService.disable2fa('usr-owner', { password: 'Pass', code: '123456' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should successfully disable 2FA for regular role with valid credentials', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword!', 10);
      const plainSecret = totpService.generateSecret();
      const encryptedSecret = cryptoService.encrypt(plainSecret);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-regular-disable',
        passwordHash,
        twoFactorSecret: encryptedSecret,
        memberships: [{ role: { name: 'Front Desk Agent' } }],
      });

      const code = totpService.generateToken(plainSecret);
      const res = await authService.disable2fa('usr-regular-disable', {
        password: 'CorrectPassword!',
        code,
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'usr-regular-disable' },
          data: expect.objectContaining({
            isTwoFactorEnabled: false,
            twoFactorSecret: null,
            twoFactorRecoveryCodes: [],
          }),
        }),
      );
    });
  });

  describe('refreshToken() & Session Family Revocation', () => {
    it('should successfully rotate valid refresh token', async () => {
      const rawToken = 'raw_refresh_token_string_1234567890';
      const tokenHash = cryptoService.hashToken(rawToken);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        userId: 'usr-rt',
        familyId: 'family-uuid-1',
        isRevoked: false,
        expiresAt,
        user: {
          id: 'usr-rt',
          email: 'rt@example.com',
          name: 'RT User',
          memberships: [],
        },
      });

      const res = await authService.refreshToken(rawToken);

      expect(res.accessToken).toBeDefined();
      expect(res.refreshToken).toBeDefined();
      // Revoked current token
      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rt-1' },
          data: { isRevoked: true },
        }),
      );
      // Created new token in same family
      expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            familyId: 'family-uuid-1',
          }),
        }),
      );
    });

    it('should revoke entire token family and throw when a revoked token is reused (theft detection)', async () => {
      const rawToken = 'compromised_refresh_token';
      const tokenHash = cryptoService.hashToken(rawToken);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-compromised',
        familyId: 'compromised-family-id',
        isRevoked: true, // Already revoked!
        expiresAt,
        user: { id: 'usr-compromised', memberships: [] },
      });

      await expect(authService.refreshToken(rawToken)).rejects.toThrow(
        expect.objectContaining({
          message: 'Compromised session detected. All refresh tokens revoked.',
        }),
      );

      // Entire family must be revoked
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { familyId: 'compromised-family-id' },
        data: { isRevoked: true },
      });
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-expired',
        isRevoked: false,
        expiresAt: expiredDate,
      });

      await expect(authService.refreshToken('expired_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout()', () => {
    it('should revoke token family when refreshToken is provided', async () => {
      const rawToken = 'token_to_logout';
      const tokenHash = cryptoService.hashToken(rawToken);

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-logout',
        familyId: 'family-logout-1',
      });

      const res = await authService.logout(rawToken);

      expect(res.success).toBe(true);
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { familyId: 'family-logout-1' },
        data: { isRevoked: true },
      });
    });

    it('should revoke all tokens for userId when userId is provided', async () => {
      const res = await authService.logout(undefined, 'usr-logout-all');

      expect(res.success).toBe(true);
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'usr-logout-all' },
        data: { isRevoked: true },
      });
    });
  });
});
