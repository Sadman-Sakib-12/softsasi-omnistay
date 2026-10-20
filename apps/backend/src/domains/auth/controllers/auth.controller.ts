import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { Verify2faDto } from '../dto/verify-2fa.dto.js';
import { ConfirmEnrollmentDto } from '../dto/confirm-enrollment.dto.js';
import { Disable2faDto } from '../dto/disable-2fa.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { PasswordResetRequestDto } from '../dto/password-reset-request.dto.js';
import { PasswordResetConfirmDto } from '../dto/password-reset-confirm.dto.js';
import { Public } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { JwtAuthGuard } from '@omnistay/backend-common';

@ApiTags('Authentication & Identity')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user credentials',
    description:
      'Validates email and password with distributed rate limiting. Returns either full access JWT session ' +
      'or a short-lived 2FA challenge token if multi-factor authentication is required for the account.',
  })
  @ApiResponse({ status: 200, description: 'Authentication successful or 2FA challenge required' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or inactive account' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded (5 requests/minute)' })
  async login(
    @Body(new ValidationPipe({ whitelist: true })) dto: LoginDto,
    @Ip() ip: string,
  ) {
    return this.authService.login(dto, ip || '127.0.0.1');
  }

  @Public()
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify 2FA TOTP or recovery code',
    description:
      'Verifies 6-digit TOTP code against short-lived challenge token. Single-use challenge token and ' +
      'replay resistance are enforced. Unlocks full session upon success.',
  })
  @ApiResponse({ status: 200, description: '2FA verified and full tokens issued' })
  @ApiResponse({ status: 401, description: 'Invalid or already consumed token/code' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async verify2fa(
    @Body(new ValidationPipe({ whitelist: true })) dto: Verify2faDto,
    @Ip() ip: string,
  ) {
    return this.authService.verify2fa(dto, ip || '127.0.0.1');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @Post('2fa/setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Initialize 2FA enrollment',
    description: 'Generates TOTP secret and backup recovery codes for the authenticated user.',
  })
  @ApiResponse({ status: 200, description: '2FA secret, recovery codes, and OTP URI returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setup2fa(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.authService.setup2fa(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @Post('2fa/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm 2FA enrollment',
    description: 'Confirms and activates 2FA on the account using a valid 6-digit code.',
  })
  @ApiResponse({ status: 200, description: '2FA enrollment confirmed and active' })
  @ApiResponse({ status: 400, description: 'Invalid 6-digit code' })
  async confirm2fa(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body(new ValidationPipe({ whitelist: true })) dto: ConfirmEnrollmentDto,
  ) {
    return this.authService.confirm2faEnrollment(user.userId, dto.code);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disable 2FA',
    description:
      'Disables 2FA on optional accounts. Disallowed for mandatory administrative and financial roles.',
  })
  @ApiResponse({ status: 200, description: '2FA successfully disabled' })
  @ApiResponse({ status: 403, description: 'Mandatory 2FA role policy violation' })
  async disable2fa(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body(new ValidationPipe({ whitelist: true })) dto: Disable2faDto,
  ) {
    return this.authService.disable2fa(user.userId, dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate refresh token',
    description:
      'Exchanges valid refresh token for a new access token and rotated refresh token. Detects token reuse ' +
      'and automatically invalidates compromised token families.',
  })
  @ApiResponse({ status: 200, description: 'Tokens successfully rotated' })
  @ApiResponse({ status: 401, description: 'Invalid, expired, or reused token' })
  async refresh(@Body(new ValidationPipe({ whitelist: true })) dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout and revoke session',
    description: 'Revokes the active refresh token family and terminates the session.',
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Body() body: { refreshToken?: string }) {
    return this.authService.logout(body?.refreshToken);
  }

  @Public()
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset link',
    description:
      'Initiates password reset workflow. Always returns a generic 200 OK message to prevent account enumeration.',
  })
  @ApiResponse({ status: 200, description: 'Password reset request accepted' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async requestPasswordReset(
    @Body(new ValidationPipe({ whitelist: true })) dto: PasswordResetRequestDto,
    @Ip() ip: string,
  ) {
    return this.authService.forgotPassword(dto.email, ip || '127.0.0.1');
  }

  @Public()
  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm password reset',
    description:
      'Atomically validates and consumes the reset token, updates password hash, and invalidates all active sessions.',
  })
  @ApiResponse({ status: 200, description: 'Password reset successful; all sessions invalidated' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async confirmPasswordReset(
    @Body(new ValidationPipe({ whitelist: true })) dto: PasswordResetConfirmDto,
    @Ip() ip: string,
  ) {
    return this.authService.resetPassword(dto, ip || '127.0.0.1');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves claims and permissions for currently authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'User profile and permissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: AuthenticatedUserPayload) {
    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
      role: user.role,
      permissions: user.permissions,
      isSuperAdmin: user.isSuperAdmin,
      is2faVerified: user.is2faVerified,
    };
  }
}
