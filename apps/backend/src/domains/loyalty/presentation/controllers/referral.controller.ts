import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { ReferralApplicationService } from '../../application/services/referral.application-service.js';
import { GenerateReferralLinkDto, RewardReferralBookingDto } from '../dto/referral.dto.js';

@ApiTags('Loyalty - Referral & Affiliate Marketing')
@Controller('api/v1/loyalty/referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralApplicationService) {}

  @Get('my-link')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get or generate user personal referral code and link' })
  getMyLink(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.referralService.getOrCreateReferralLink(user.userId);
  }

  @Post('custom-link')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate custom influencer referral code' })
  createCustomLink(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: GenerateReferralLinkDto,
  ) {
    return this.referralService.getOrCreateReferralLink(user.userId, dto);
  }

  @Post('click/:code')
  @ApiOperation({ summary: 'Track referral link click telemetry' })
  trackClick(@Param('code') code: string) {
    return this.referralService.recordClick(code);
  }

  @Post('reward')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Credit double-sided $25 referral reward upon completed stay' })
  rewardBooking(@Body() dto: RewardReferralBookingDto) {
    return this.referralService.rewardReferralBooking(dto);
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get personal referral affiliate conversion metrics' })
  getStats(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.referralService.getReferralStats(user.userId);
  }
}
