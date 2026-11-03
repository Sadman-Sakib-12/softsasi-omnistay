import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { YieldPricingService } from '../../application/services/yield-pricing.service.js';
import { YieldPricingQueryDto } from '../dto/yield-pricing.dto.js';
import { JwtAuthGuard, CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Dynamic Yield Pricing Engine (Chapter 4.1.3.5 & 14.3)')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/hotels')
export class YieldPricingController {
  constructor(private readonly yieldPricingService: YieldPricingService) {}

  @Get(':propertyId/yield-pricing')
  @ApiOperation({
    summary: 'Calculate dynamic yield pricing and occupancy surge rates',
    description: 'Computes real-time dynamic rates for all room categories in a property based on occupancy thresholds (>=70% -> +10%, >=85% -> +25%, >=95% -> +50%) and last-minute liquidation rules (<48h -> -15%).',
  })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({ status: 200, description: 'Dynamic yield pricing breakdown' })
  async getYieldPricing(
    @Param('propertyId') propertyId: string,
    @Query(new ValidationPipe({ transform: true, whitelist: true })) query: YieldPricingQueryDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.yieldPricingService.calculateYieldPricing(
      propertyId,
      query,
      user.organizationId || '',
      user,
    );
  }

  @Get(':propertyId/yield-pricing/recommendations')
  @ApiOperation({
    summary: 'Get revenue management yield recommendations',
    description: 'Analyzes RevPAR optimization opportunities, MLOS (Minimum Length of Stay) thresholds, and weekend surge recommendations.',
  })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({ status: 200, description: 'Revenue management yield recommendations' })
  async getYieldRecommendations(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.yieldPricingService.getYieldRecommendations(
      propertyId,
      user.organizationId || '',
      user,
    );
  }
}

