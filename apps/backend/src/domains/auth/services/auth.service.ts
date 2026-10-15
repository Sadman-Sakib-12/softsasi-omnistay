import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CryptoService } from './crypto.service.js';
import { TotpService } from './totp.service.js';
import { RateLimiterService } from './rate-limiter.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { Verify2faDto } from '../dto/verify-2fa.dto.js';
import { Disable2faDto } from '../dto/disable-2fa.dto.js';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

export const MANDATORY_2FA_ROLES = [
  'SuperAdmin',
  'Company Owner/GM',
  'Financial Accountant',
];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly totpService: TotpService,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  /**
   * Authenticates user credentials.
   * If mandatory 2FA or enabled 2FA applies, returns a 2FA challenge.
   * Otherwise returns full JWT Bearer access token and refresh token.
   */
  async login(dto: LoginDto, ip: string) {
    const rateLimitKey = `login:${ip}:${dto.email.toLowerCase()}`;
    this.rateLimiter.consume(rateLimitKey, 5, 60000);

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

    this.rateLimiter.reset(rateLimitKey);

    // Resolve tenant / membership server-side (prevent trusting client-supplied permissions or orgs)
    const { activeOrg, activeRole, permissions } = this.resolveTenantMembership(
      user.memberships,
      dto.organizationId,
    );

    const isMandatory2faRole = activeRole && MANDATORY_2FA_ROLES.includes(activeRole.name);
    const requires2fa = user.isTwoFactorEnabled || isMandatory2faRole;

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

      // Generate short-lived purpose-restricted challenge token (5 min expiry)
      const tempToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          organizationId: activeOrg?.id,
          type: '2FA_CHALLENGE',
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
   * Unlocks administrative session and returns full access token + refresh token.
   */
  async verify2fa(dto: Verify2faDto, ip: string) {
    this.rateLimiter.consume(`otp:${ip}`, 6, 60000);

    let decoded: any;
    try {
      decoded = this.jwtService.verify(dto.tempToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired 2FA challenge token');
    }

    if (!decoded || decoded.type !== '2FA_CHALLENGE' || !decoded.sub) {
      throw new UnauthorizedException('Invalid token purpose');
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

    const decryptedSecret = this.cryptoService.decrypt(user.twoFactorSecret);
    let isCodeValid = false;

    if (dto.code) {
      isCodeValid = this.totpService.verifyToken(dto.code, decryptedSecret);
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
      isSuperAdmin: activeRole?.name === 'SuperAdmin',
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
      isSuperAdmin: activeRole?.name === 'SuperAdmin',
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
}
