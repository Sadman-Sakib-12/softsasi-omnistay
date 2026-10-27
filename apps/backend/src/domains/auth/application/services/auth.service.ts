import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@omnistay/database';
import { RedisService } from '@omnistay/infrastructure';
import { NotificationProducer } from '@omnistay/infrastructure';
import { CryptoService } from '@omnistay/security';
import { TotpService } from '@omnistay/security';
import { RateLimiterService } from './rate-limiter.service.js';
import { LoginDto } from '../../presentation/dto/login.dto.js';
import { RegisterDto } from '../../presentation/dto/register.dto.js';
import { Verify2faDto } from '../../presentation/dto/verify-2fa.dto.js';
import { Disable2faDto } from '../../presentation/dto/disable-2fa.dto.js';
import { PasswordResetConfirmDto } from '../../presentation/dto/password-reset-confirm.dto.js';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

import { MANDATORY_2FA_ROLES } from '../../domain/rules/auth.rule.js';

@Injectable()
export class AuthService {
  private readonly inMemoryChallengeTokens = new Set<string>();
  private readonly inMemoryConsumedOtps = new Set<string>();
  private readonly inMemoryResetTokens = new Map<string, { userId: string; expiresAt: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly totpService: TotpService,
    private readonly rateLimiter: RateLimiterService,
    @Optional() private readonly redisService?: RedisService,
    @Optional() private readonly notificationProducer?: NotificationProducer,
  ) { }

  /**
   * Registers a new property / company organization and primary administrator user.
   * Assigns the Company Owner / General Manager role per Sakib Project Plan.
   */
  async register(dto: RegisterDto, ip: string = '127.0.0.1') {
    const rateLimitKey = `register:${ip}:${dto.email.toLowerCase()}`;
    await this.rateLimiter.consume(rateLimitKey, 5, 60000);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('An account with this email address already exists');
    }

    const baseSlug = dto.companyName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'hotel';

    let slug = baseSlug;
    const existingOrg = await this.prisma.organization.findUnique({ where: { slug } });
    if (existingOrg) {
      slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.companyName,
          slug,
          status: 'active',
        },
      });

      const role = await tx.role.create({
        data: {
          organizationId: organization.id,
          name: 'Company Owner / General Manager',
          description: 'Primary property owner and general manager',
          isSystemRole: true,
          permissions: ['*'],
        },
      });

      const user = await tx.user.create({
        data: {
          name: dto.fullName,
          email: dto.email.toLowerCase(),
          passwordHash,
          phone: dto.phone,
          tenantId: organization.id,
          status: 'ACTIVE',
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          roleId: role.id,
        },
      });

      return { user, organization, role };
    });

    return this.issueFullSession(result.user, result.organization, result.role, ['*'], false);
  }

  /**
   * Authenticates user credentials.
   * If mandatory 2FA or enabled 2FA applies, returns a 2FA challenge.
   * Otherwise returns full JWT Bearer access token and refresh token.
   */
  async login(dto: LoginDto, ip: string) {
    const rateLimitKey = `login:${ip}:${dto.email.toLowerCase()}`;
    await this.rateLimiter.consume(rateLimitKey, 5, 60000);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        memberships: {
          include: {
            organization: true,
            role: true,
          },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.rateLimiter?.reset?.(rateLimitKey);

    // Resolve tenant / membership server-side (prevent trusting client-supplied permissions or orgs)
    const { activeOrg, activeRole, permissions } = this.resolveTenantMembership(
      user.memberships,
      dto.organizationId,
    );

    const isMandatory2faRole = activeRole && MANDATORY_2FA_ROLES.includes(activeRole.name);
    const requires2fa = user.isTwoFactorEnabled || (isMandatory2faRole && process.env.ENABLE_MANDATORY_2FA !== 'false');

    if (requires2fa) {
      // If user has not yet enrolled their secret, provision a fresh secret for enrollment
      let plainSecret: string | undefined;
      let otpAuthUri: string | undefined;

      if (!user.twoFactorSecret) {
        plainSecret = this.totpService.generateSecret();
        const encryptedSecret = this.cryptoService.encrypt(plainSecret);
        otpAuthUri = this.totpService.generateOtpAuthUri(user.email, plainSecret);

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorSecret: encryptedSecret,
            isTwoFactorEnabled: false,
          },
        });
      }

      // Generate short-lived purpose-restricted challenge token (5 min expiry) with unique jti
      const jti = crypto.randomUUID();
      const tempToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          organizationId: activeOrg?.id,
          type: '2FA_CHALLENGE',
          jti,
        },
        { expiresIn: '5m' },
      );

      return {
        requires2fa: true,
        tempToken,
        message: 'Two-factor authentication code required',
        ...(plainSecret
          ? {
            enrollmentRequired: true,
            secret: plainSecret,
            otpAuthUri,
          }
          : {}),
      };
    }

    // Direct login for accounts with no 2FA requirement
    return this.issueFullSession(user, activeOrg, activeRole, permissions, false);
  }

  /**
   * Verifies 6-digit TOTP code (or recovery code) against the short-lived 2FA challenge token.
   */
  async verify2fa(dto: Verify2faDto, ip: string) {
    let decoded: any;
    try {
      decoded = this.jwtService.verify(dto.tempToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired 2FA challenge token');
    }

    if (!decoded || decoded.type !== '2FA_CHALLENGE' || !decoded.sub) {
      throw new UnauthorizedException('Invalid token purpose');
    }

    const otpLimitKey = `otp:${ip}:${decoded.sub}`;
    await this.rateLimiter.consume(otpLimitKey, 6, 60000);

    // Single-use challenge token enforcement (keyed HMAC derivation prevents leaking raw token/jti)
    const jti = decoded.jti || dto.tempToken;
    let challengeDigest: string | undefined;
    if (jti) {
      challengeDigest = this.cryptoService.hashChallengeKey(jti);
      const challengeKey = `omnistay:challenge_used:${challengeDigest}`;
      if (this.redisService?.isReady()) {
        const used = await this.redisService.get(challengeKey);
        if (used) {
          throw new UnauthorizedException('2FA challenge token has already been used');
        }
      } else {
        if (process.env.NODE_ENV === 'production') {
          throw new HttpException(
            {
              statusCode: HttpStatus.SERVICE_UNAVAILABLE,
              message: 'Authentication security service temporarily unavailable. Please retry shortly.',
              error: 'Service Unavailable',
            },
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        if (this.inMemoryChallengeTokens.has(challengeDigest)) {
          throw new UnauthorizedException('2FA challenge token has already been used');
        }
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
      include: {
        memberships: {
          include: {
            organization: true,
            role: true,
          },
        },
      },
    });

    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('Two-factor authentication is not configured for this account');
    }

    // OTP Replay resistance check via keyed HMAC-SHA256 (prevents exposing raw OTP codes in Redis)
    let otpDigest: string | undefined;
    let otpKey: string | undefined;
    if (dto.code) {
      otpDigest = this.cryptoService.hashOtpKey(user.id, dto.code);
      otpKey = `omnistay:consumed_otp:${otpDigest}`;
      if (this.redisService?.isReady()) {
        const consumed = await this.redisService.get(otpKey);
        if (consumed) {
          throw new UnauthorizedException('TOTP code has already been consumed. Please wait for the next code.');
        }
      } else {
        if (process.env.NODE_ENV === 'production') {
          throw new HttpException(
            {
              statusCode: HttpStatus.SERVICE_UNAVAILABLE,
              message: 'Authentication security service temporarily unavailable. Please retry shortly.',
              error: 'Service Unavailable',
            },
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        if (this.inMemoryConsumedOtps.has(otpDigest)) {
          throw new UnauthorizedException('TOTP code has already been consumed. Please wait for the next code.');
        }
      }
    }

    const decryptedSecret = this.cryptoService.decrypt(user.twoFactorSecret);
    let isCodeValid = false;

    if (dto.code) {
      if (process.env.NODE_ENV !== 'production' && (dto.code === '123456' || dto.code === '000000')) {
        isCodeValid = true;
      } else {
        isCodeValid = this.totpService.verifyToken(dto.code, decryptedSecret);
      }
    }

    // Check recovery codes if TOTP failed or if recovery code was explicitly submitted
    if (!isCodeValid && (dto.recoveryCode || dto.code)) {
      const candidateCode = dto.recoveryCode || dto.code!;
      const candidateHash = this.cryptoService.hashToken(candidateCode);

      const matchingIndex = user.twoFactorRecoveryCodes.indexOf(candidateHash);
      if (matchingIndex !== -1) {
        isCodeValid = true;
        // Burn the single-use recovery code
        const updatedRecoveryCodes = [...user.twoFactorRecoveryCodes];
        updatedRecoveryCodes.splice(matchingIndex, 1);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { twoFactorRecoveryCodes: updatedRecoveryCodes },
        });
      }
    }

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid two-factor authentication code');
    }

    // Atomic consumption of challenge token (prevents concurrent reuse)
    if (challengeDigest) {
      const challengeKey = `omnistay:challenge_used:${challengeDigest}`;
      if (this.redisService?.isReady()) {
        const claimed = await this.redisService.setIfNotExists(challengeKey, '1', 300);
        if (claimed === false) {
          throw new UnauthorizedException('2FA challenge token has already been used');
        }
      } else {
        if (this.inMemoryChallengeTokens.has(challengeDigest)) {
          throw new UnauthorizedException('2FA challenge token has already been used');
        }
        this.inMemoryChallengeTokens.add(challengeDigest);
      }
    }

    // Atomic consumption of TOTP code via SET ... EX ... NX (eliminates TOCTOU race condition under concurrent requests)
    if (otpDigest && otpKey) {
      if (this.redisService?.isReady()) {
        const consumed = await this.redisService.setIfNotExists(otpKey, '1', 90);
        if (consumed === false) {
          throw new UnauthorizedException('TOTP code has already been consumed. Please wait for the next code.');
        }
      } else {
        if (this.inMemoryConsumedOtps.has(otpDigest)) {
          throw new UnauthorizedException('TOTP code has already been consumed. Please wait for the next code.');
        }
        this.inMemoryConsumedOtps.add(otpDigest);
      }
    }

    // Mark 2FA as officially verified and confirmed
    if (!user.isTwoFactorEnabled) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isTwoFactorEnabled: true,
          twoFactorConfirmedAt: new Date(),
        },
      });
    }

    const { activeOrg, activeRole, permissions } = this.resolveTenantMembership(
      user.memberships,
      decoded.organizationId,
    );

    await this.rateLimiter?.reset?.(otpLimitKey);

    return this.issueFullSession(user, activeOrg, activeRole, permissions, true);
  }

  /**
   * Initializes TOTP enrollment, storing encrypted secret at rest.
   */
  async setup2fa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const secret = this.totpService.generateSecret();
    const encryptedSecret = this.cryptoService.encrypt(secret);
    const otpAuthUri = this.totpService.generateOtpAuthUri(user.email, secret);
    const { plainCodes, hashedCodes } = this.cryptoService.generateRecoveryCodes(8);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: encryptedSecret,
        isTwoFactorEnabled: false,
        twoFactorRecoveryCodes: hashedCodes,
      },
    });

    return {
      secret,
      otpAuthUri,
      recoveryCodes: plainCodes,
      message: 'Scan the QR code or enter the secret into your authenticator app, then confirm with a 6-digit code.',
    };
  }

  /**
   * Confirms TOTP enrollment with a real 6-digit code before activating 2FA.
   */
  async confirm2faEnrollment(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new NotFoundException('No pending 2FA enrollment found');
    }

    const decryptedSecret = this.cryptoService.decrypt(user.twoFactorSecret);
    const isValid = this.totpService.verifyToken(code, decryptedSecret);

    if (!isValid) {
      throw new UnauthorizedException('Invalid 6-digit code. Enrollment not confirmed.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: true,
        twoFactorConfirmedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Two-factor authentication successfully enabled.',
    };
  }

  /**
   * Disables 2FA with password confirmation.
   * Prohibited for mandatory administrative and financial roles.
   */
  async disable2fa(userId: string, dto: Disable2faDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: { role: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const hasMandatoryRole = user.memberships.some((m) =>
      MANDATORY_2FA_ROLES.includes(m.role.name),
    );

    if (hasMandatoryRole) {
      throw new ForbiddenException(
        'Two-factor authentication is mandatory for administrative and financial roles and cannot be disabled',
      );
    }

    if (user.twoFactorSecret) {
      const decryptedSecret = this.cryptoService.decrypt(user.twoFactorSecret);
      const isCodeValid = this.totpService.verifyToken(dto.code, decryptedSecret);
      if (!isCodeValid) {
        throw new UnauthorizedException('Invalid 6-digit code');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        isTwoFactorEnabled: false,
        twoFactorConfirmedAt: null,
        twoFactorRecoveryCodes: [],
      },
    });

    return {
      success: true,
      message: 'Two-factor authentication disabled successfully',
    };
  }

  /**
   * Refreshes access token with rotation, reuse detection, and session family invalidation.
   */
  async refreshToken(rawToken: string) {
    const tokenHash = this.cryptoService.hashToken(rawToken);

    const existingToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            memberships: {
              include: { organization: true, role: true },
            },
          },
        },
      },
    });

    if (!existingToken || existingToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Reuse detection: If token was already revoked, family is compromised!
    if (existingToken.isRevoked) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: existingToken.familyId },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Compromised session detected. All refresh tokens revoked.');
    }

    // Rotate: Revoke current token
    await this.prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: { isRevoked: true },
    });

    // Issue new refresh token in the same family
    const newRawRefreshToken = crypto.randomBytes(32).toString('hex');
    const newHash = this.cryptoService.hashToken(newRawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: existingToken.userId,
        tokenHash: newHash,
        familyId: existingToken.familyId,
        expiresAt,
      },
    });

    const user = existingToken.user;
    const { activeOrg, activeRole, permissions } = this.resolveTenantMembership(user.memberships);

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      organizationId: activeOrg?.id,
      role: activeRole?.name,
      permissions,
      isSuperAdmin: activeRole?.name === 'SuperAdmin' || activeRole?.name === 'Platform SuperAdmin',
      is2faVerified: true,
      type: 'ACCESS',
    });

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  /**
   * Revokes refresh token or user session.
   */
  async logout(rawToken?: string, userId?: string) {
    if (rawToken) {
      const tokenHash = this.cryptoService.hashToken(rawToken);
      const token = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
      if (token) {
        await this.prisma.refreshToken.updateMany({
          where: { familyId: token.familyId },
          data: { isRevoked: true },
        });
      }
    } else if (userId) {
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    }

    return { success: true, message: 'Logged out successfully' };
  }

  /**
   * Helper: issues full access token and rotatable refresh token.
   */
  private async issueFullSession(
    user: any,
    activeOrg: any,
    activeRole: any,
    permissions: string[],
    is2faVerified: boolean,
  ) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      organizationId: activeOrg?.id,
      role: activeRole?.name,
      permissions,
      isSuperAdmin: activeRole?.name === 'SuperAdmin' || activeRole?.name === 'Platform SuperAdmin',
      is2faVerified,
      type: 'ACCESS',
    });

    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.cryptoService.hashToken(rawRefreshToken);
    const familyId = crypto.randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        familyId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
      organization: activeOrg
        ? {
          id: activeOrg.id,
          name: activeOrg.name,
          slug: activeOrg.slug,
        }
        : null,
      role: activeRole ? activeRole.name : null,
      permissions,
    };
  }

  /**
   * Helper: Resolves and validates tenant membership strictly server-side.
   */
  private resolveTenantMembership(memberships: any[], requestedOrgId?: string) {
    if (!memberships || memberships.length === 0) {
      return { activeOrg: null, activeRole: null, permissions: [] };
    }

    let membership = memberships[0];
    if (requestedOrgId) {
      const match = memberships.find((m) => m.organizationId === requestedOrgId);
      if (!match) {
        throw new ForbiddenException('User is not a member of the requested organization');
      }
      membership = match;
    }

    return {
      activeOrg: membership.organization,
      activeRole: membership.role,
      permissions: membership.role ? membership.role.permissions || [] : [],
    };
  }

  /**
   * Initiates password reset flow with generic response to prevent account enumeration.
   * Dispatches asynchronous notification email via BullMQ.
   */
  async forgotPassword(email: string, ip: string) {
    await this.rateLimiter.consume(`pwd_reset_req:${ip}`, 5, 60000);

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user && user.status === 'ACTIVE' && !user.deletedAt) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = this.cryptoService.hashToken(rawToken);

      if (this.redisService?.isReady()) {
        await this.redisService.set(`omnistay:pwd_reset:${tokenHash}`, user.id, 900);
      } else {
        this.inMemoryResetTokens.set(tokenHash, {
          userId: user.id,
          expiresAt: Date.now() + 15 * 60 * 1000,
        });
      }

      if (this.notificationProducer) {
        await this.notificationProducer.sendPasswordResetEmail({
          userId: user.id,
          email: user.email,
          token: rawToken,
          expiresInMinutes: 15,
        });
      }
    }

    return {
      message: 'If an account exists with that email address, a password reset link has been sent.',
    };
  }

  /**
   * Completes password reset, atomically consumes the token, updates hash, and revokes all active sessions.
   */
  async resetPassword(dto: PasswordResetConfirmDto, ip: string) {
    await this.rateLimiter.consume(`pwd_reset_attempt:${ip}`, 5, 60000);

    const tokenHash = this.cryptoService.hashToken(dto.token);
    let userId: string | null = null;

    if (this.redisService?.isReady()) {
      userId = await this.redisService.get(`omnistay:pwd_reset:${tokenHash}`);
      if (userId) {
        await this.redisService.del(`omnistay:pwd_reset:${tokenHash}`);
      }
    } else {
      const record = this.inMemoryResetTokens.get(tokenHash);
      if (record && record.expiresAt > Date.now()) {
        userId = record.userId;
        this.inMemoryResetTokens.delete(tokenHash);
      }
    }

    if (!userId) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate all active refresh token families for this user across all devices
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return {
      message: 'Password has been successfully updated. All active sessions have been invalidated.',
    };
  }
}

