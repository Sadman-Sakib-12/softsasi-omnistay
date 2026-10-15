import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthenticatedUserPayload } from '../../../common/decorators/current-user.decorator.js';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  organizationId?: string;
  role?: string;
  permissions?: string[];
  isSuperAdmin?: boolean;
  is2faVerified?: boolean;
  type?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'omnistay_enterprise_super_secret_jwt_key_2026',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUserPayload> {
    // Purpose-restriction: 2FA challenge tokens are strictly prohibited from accessing protected routes
    if (payload.type === '2FA_CHALLENGE') {
      throw new UnauthorizedException('Incomplete authentication: 2FA verification required');
    }

    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name || '',
      organizationId: payload.organizationId,
      role: payload.role,
      permissions: payload.permissions || [],
      isSuperAdmin: !!payload.isSuperAdmin,
      is2faVerified: !!payload.is2faVerified,
    };
  }
}
