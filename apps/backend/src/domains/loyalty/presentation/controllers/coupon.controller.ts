import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { CouponApplicationService } from '../../application/services/coupon.application-service.js';
import { CreateCouponDto, ValidateCouponDto } from '../dto/coupon.dto.js';

@ApiTags('Loyalty - Promotional Coupons & Vouchers')
@Controller('api/v1/loyalty/coupons')
export class CouponController {
  constructor(private readonly couponService: CouponApplicationService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM')
  @ApiOperation({ summary: 'Create marketing campaign coupon' })
  createCoupon(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateCouponDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.couponService.createCoupon(tenantId, dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM')
  @ApiOperation({ summary: 'List all promotional coupons' })
  getCoupons(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.couponService.getCoupons(tenantId);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate coupon and calculate checkout discount' })
  validateCoupon(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: ValidateCouponDto,
  ) {
    const tenantId = user?.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.couponService.validateCoupon(tenantId, dto);
  }
}
