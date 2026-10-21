import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '@omnistay/database';

// Repositories
import { AUTH_REPOSITORY_TOKEN } from './domain/repositories/auth.repository.interface.js';
import { PrismaAuthRepository } from './infrastructure/repositories/prisma-auth.repository.js';

// Controllers
import { AuthController } from './presentation/controllers/auth.controller.js';

// Services
import { AuthService } from './application/services/auth.service.js';
import { CryptoService } from '@omnistay/security';
import { TotpService } from '@omnistay/security';
import { RateLimiterService } from './application/services/rate-limiter.service.js';
import { SmsService } from './application/services/sms.service.js';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { RolesGuard } from '@omnistay/backend-common';
import { PermissionsGuard } from '@omnistay/backend-common';
import { TenantGuard } from '@omnistay/backend-common';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'omnistay_enterprise_super_secret_jwt_key_2026',
      signOptions: { expiresIn: '15m' }, // Access tokens expire in 15 minutes
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_REPOSITORY_TOKEN,
      useClass: PrismaAuthRepository,
    },
    PrismaAuthRepository,
    AuthService,
    CryptoService,
    TotpService,
    RateLimiterService,
    SmsService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    TenantGuard,
  ],
  exports: [
    AUTH_REPOSITORY_TOKEN,
    PrismaAuthRepository,
    AuthService,
    CryptoService,
    TotpService,
    SmsService,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    TenantGuard,
    JwtModule,
  ],
})
export class AuthModule {}
