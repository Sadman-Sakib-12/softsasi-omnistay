import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { LoyaltyProgramApplicationService } from '../../application/services/loyalty-program.application-service.js';
import { CreateLoyaltyTierDto, EarnPointsDto, RedeemPointsDto } from '../dto/loyalty.dto.js';

@ApiTags('Loyalty - Tiered Rewards Program')
@Controller('api/v1/loyalty/program')
export class LoyaltyProgramController {
  constructor(private readonly loyaltyService: LoyaltyProgramApplicationService) {}

  @Post('tiers')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM')
  @ApiOperation({ summary: 'Create or update loyalty status tier (Bronze to Platinum)' })
  createTier(@Body() dto: CreateLoyaltyTierDto) {
    return this.loyaltyService.createTier(dto);
  }

  @Get('tiers')
  @ApiOperation({ summary: 'List all loyalty tiers and perks' })
  getTiers() {
    return this.loyaltyService.getTiers();
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current member tier, points and ledger' })
  getMyLoyaltyStatus(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.loyaltyService.getOrCreateMember(user.userId);
  }

  @Post('earn')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Earn points for hospitality spend' })
  earnPoints(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: EarnPointsDto,
  ) {
    return this.loyaltyService.earnPoints(user.userId, dto);
  }

  @Post('redeem')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Redeem loyalty points for checkout cash discount' })
  redeemPoints(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: RedeemPointsDto,
  ) {
    return this.loyaltyService.redeemPoints(user.userId, dto);
  }
}
