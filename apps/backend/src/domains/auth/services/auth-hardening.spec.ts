import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CryptoService } from './crypto.service.js';
import { TotpService } from './totp.service.js';

describe('AuthService Security Hardening & Password Reset', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;
  let cryptoService: CryptoService;
  let mockTotpService: any;
  let mockRateLimiter: any;
  let mockRedis: any;
  let mockQueueProducer: any;

  beforeEach(() => {
    cryptoService = new CryptoService();

    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
      refreshToken: {
        create: vi.fn().mockResolvedValue({}),
        updateMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
    };

    mockJwtService = {
      sign: vi.fn().mockReturnValue('mock_jwt_token'),
      verify: vi.fn(),
    };

    mockTotpService = {
      generateSecret: vi.fn().mockReturnValue('BASE32SECRET3232'),
      generateOtpAuthUri: vi.fn().mockReturnValue('otpauth://totp/OmniStay:test@test.com?secret=BASE32SECRET3232'),
      verifyToken: vi.fn(),
    };

    mockRateLimiter = {
      consume: vi.fn().mockResolvedValue(undefined),
      reset: vi.fn().mockResolvedValue(undefined),
    };

    mockRedis = {
      isReady: vi.fn().mockReturnValue(false),
      get: vi.fn(),
      set: vi.fn(),
      setIfNotExists: vi.fn(),
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
      mockTotpService,
      mockRateLimiter,
      mockRedis,
      mockQueueProducer,
    );
  });

  afterEach(() => {
    process.env.NODE_ENV = 'test';
  });

  describe('2FA Challenge Token Single-Use Enforcement', () => {
    it('should reject replay of the same 2FA challenge token', async () => {
      const jti = 'challenge-uuid-1234';
      mockJwtService.verify.mockReturnValue({
        sub: 'usr-1',
        type: '2FA_CHALLENGE',
        jti,
      });

      const encryptedSecret = cryptoService.encrypt('JBSWY3DPEHPK3PXP');
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-1',
        email: 'user@example.com',
        twoFactorSecret: encryptedSecret,
        isTwoFactorEnabled: true,
        memberships: [],
      });
      mockTotpService.verifyToken.mockReturnValue(true);

      // First verification succeeds
      await authService.verify2fa({ tempToken: 'token1', code: '123456' }, '127.0.0.1');

      // Second verification with the exact same token must throw UnauthorizedException
      await expect(
        authService.verify2fa({ tempToken: 'token1', code: '654321' }, '127.0.0.1'),
      ).rejects.toThrow(
        expect.objectContaining({
          message: '2FA challenge token has already been used',
        }),
      );
    });
  });

  describe('TOTP Code Replay Resistance & Keyed HMAC Derivation', () => {
    it('should reject replaying the exact same 6-digit TOTP code within its active window', async () => {
      const encryptedSecret = cryptoService.encrypt('JBSWY3DPEHPK3PXP');
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-replay',
        email: 'user@example.com',
        twoFactorSecret: encryptedSecret,
        isTwoFactorEnabled: true,
        memberships: [],
      });
      mockTotpService.verifyToken.mockReturnValue(true);

      mockJwtService.verify.mockReturnValue({
        sub: 'usr-replay',
        type: '2FA_CHALLENGE',
        jti: 'jti-1',
      });

      // First attempt with code 999888 consumes it
      await authService.verify2fa({ tempToken: 'tok-1', code: '999888' }, '127.0.0.1');

      mockJwtService.verify.mockReturnValue({
        sub: 'usr-replay',
        type: '2FA_CHALLENGE',
        jti: 'jti-2', // new challenge token
      });

      // Replaying the exact same code 999888 must fail
      await expect(
        authService.verify2fa({ tempToken: 'tok-2', code: '999888' }, '127.0.0.1'),
      ).rejects.toThrow(
        expect.objectContaining({
          message: 'TOTP code has already been consumed. Please wait for the next code.',
        }),
      );
    });

    it('should derive Redis keys using keyed HMAC without exposing raw OTP codes in key names', async () => {
      mockRedis.isReady.mockReturnValue(true);
      mockRedis.get.mockResolvedValue(null);
      mockRedis.setIfNotExists.mockResolvedValue(true);

      const encryptedSecret = cryptoService.encrypt('JBSWY3DPEHPK3PXP');
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-hmac-test',
        email: 'hmac@example.com',
        twoFactorSecret: encryptedSecret,
        isTwoFactorEnabled: true,
        memberships: [],
      });
      mockTotpService.verifyToken.mockReturnValue(true);
      mockJwtService.verify.mockReturnValue({
        sub: 'usr-hmac-test',
        type: '2FA_CHALLENGE',
        jti: 'jti-hmac-unique',
      });

      const submittedCode = '849201';
      await authService.verify2fa({ tempToken: 'tok-hmac', code: submittedCode }, '127.0.0.1');

      // Verify that Redis was called
      expect(mockRedis.setIfNotExists).toHaveBeenCalled();

      // Inspect all Redis keys accessed
      const calledKeys: string[] = mockRedis.setIfNotExists.mock.calls.map((call: any[]) => call[0]);
      const otpSetKey = calledKeys.find((k) => k.startsWith('omnistay:consumed_otp:'));
      expect(otpSetKey).toBeDefined();

      // CRITICAL: Raw OTP code must NEVER be present anywhere in the Redis key name
      expect(otpSetKey).not.toContain(submittedCode);

      // Digest must match keyed HMAC derivation
      const expectedDigest = cryptoService.hashOtpKey('usr-hmac-test', submittedCode);
      expect(otpSetKey).toBe(`omnistay:consumed_otp:${expectedDigest}`);
    });

    it('should atomically reject concurrent verification requests using the same TOTP code in Redis', async () => {
      mockRedis.isReady.mockReturnValue(true);
      mockRedis.get.mockResolvedValue(null);

      // Simulate atomic SET NX: first request wins (returns true), second request loses (returns false)
      let firstCall = true;
      mockRedis.setIfNotExists.mockImplementation(async (key: string) => {
        if (key.startsWith('omnistay:consumed_otp:')) {
          if (firstCall) {
            firstCall = false;
            return true; // Won the atomic race
          }
          return false; // Key already existed / race lost
        }
        return true;
      });

      const encryptedSecret = cryptoService.encrypt('JBSWY3DPEHPK3PXP');
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-concurrent-redis',
        email: 'concurrent@example.com',
        twoFactorSecret: encryptedSecret,
        isTwoFactorEnabled: true,
        memberships: [],
      });
      mockTotpService.verifyToken.mockReturnValue(true);

      mockJwtService.verify.mockImplementation((token: string) => ({
        sub: 'usr-concurrent-redis',
        type: '2FA_CHALLENGE',
        jti: `jti-${token}`,
      }));

      // Fire 2 concurrent requests with the exact same valid OTP
      const req1 = authService.verify2fa({ tempToken: 'tok-race-1', code: '456789' }, '127.0.0.1');
      const req2 = authService.verify2fa({ tempToken: 'tok-race-2', code: '456789' }, '127.0.0.1');

      const results = await Promise.allSettled([req1, req2]);
      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);

      const rejectedReason = (rejected[0] as PromiseRejectedResult).reason;
      expect(rejectedReason).toBeInstanceOf(UnauthorizedException);
      expect(rejectedReason.message).toBe(
        'TOTP code has already been consumed. Please wait for the next code.',
      );
    });

    it('should FAIL CLOSED with 503 Service Unavailable when Redis is unavailable in production during 2FA verify', async () => {
      process.env.NODE_ENV = 'production';
      mockRedis.isReady.mockReturnValue(false);

      mockJwtService.verify.mockReturnValue({
        sub: 'usr-prod-fail',
        type: '2FA_CHALLENGE',
        jti: 'jti-prod',
      });

      await expect(
        authService.verify2fa({ tempToken: 'tok-prod', code: '123456' }, '127.0.0.1'),
      ).rejects.toThrow(
        expect.objectContaining({
          status: 503,
        }),
      );
    });
  });

  describe('Password Reset Workflow', () => {
    it('should return generic success message and queue email when user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-reset-1',
        email: 'target@omnistay.com',
        status: 'ACTIVE',
        deletedAt: null,
      });

      const response = await authService.forgotPassword('target@omnistay.com', '127.0.0.1');

      expect(response.message).toContain('If an account exists');
      expect(mockQueueProducer.sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr-reset-1',
          email: 'target@omnistay.com',
        }),
      );
    });

    it('should return the exact same generic message when account does not exist (prevents enumeration)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await authService.forgotPassword('unknown@omnistay.com', '127.0.0.1');

      expect(response.message).toContain('If an account exists');
      expect(mockQueueProducer.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should successfully reset password, hash new password, and revoke all active refresh tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-reset-2',
        email: 'alice@omnistay.com',
        status: 'ACTIVE',
      });

      // Request reset to store token
      await authService.forgotPassword('alice@omnistay.com', '127.0.0.1');
      const submittedJob = mockQueueProducer.sendPasswordResetEmail.mock.calls[0][0];
      const rawToken = submittedJob.token;

      // Reset password with rawToken
      const result = await authService.resetPassword(
        {
          token: rawToken,
          newPassword: 'BrandNewPassword123!',
        },
        '127.0.0.1',
      );

      expect(result.message).toContain('Password has been successfully updated');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'usr-reset-2' },
          data: expect.objectContaining({
            passwordHash: expect.any(String),
          }),
        }),
      );
      // All existing refresh tokens invalidated
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'usr-reset-2' },
        data: { isRevoked: true },
      });
    });

    it('should throw BadRequestException when token is reused (single-use enforced)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-reset-3',
        email: 'bob@omnistay.com',
        status: 'ACTIVE',
      });

      await authService.forgotPassword('bob@omnistay.com', '127.0.0.1');
      const rawToken = mockQueueProducer.sendPasswordResetEmail.mock.calls[0][0].token;

      // First use succeeds
      await authService.resetPassword(
        { token: rawToken, newPassword: 'FirstPassword123!' },
        '127.0.0.1',
      );

      // Replay of consumed token must fail
      await expect(
        authService.resetPassword(
          { token: rawToken, newPassword: 'SecondPassword123!' },
          '127.0.0.1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when token is completely invalid', async () => {
      await expect(
        authService.resetPassword(
          { token: 'invalid_nonexistent_token', newPassword: 'Password123!' },
          '127.0.0.1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
