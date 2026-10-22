import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { AiMarketingStudioService } from '../../application/services/ai-marketing.service.js';

@ApiTags('AI - Marketing Studio & Creative Generator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/ai/marketing')
export class AiMarketingController {
  constructor(private readonly marketingService: AiMarketingStudioService) {}

  @Post('generate-copy')
  @ApiOperation({ summary: 'Generate high-converting marketing copy with custom tone (Luxury, Romantic, Family, Business)' })
  generateCopy(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() body: {
      title: string;
      targetAudience: string;
      tone: 'Luxury' | 'Romantic' | 'Family' | 'Business';
      channel: 'email' | 'sms' | 'social_instagram' | 'social_facebook' | 'seo_description';
      highlights: string[];
    },
  ) {
    return this.marketingService.generateMarketingCopy({
      tenantId: user.organizationId || '00000000-0000-0000-0000-000000000001',
      ...body,
    });
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'List all generated marketing studio campaigns' })
  getCampaigns(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.marketingService.getCampaigns(user.organizationId || '00000000-0000-0000-0000-000000000001');
  }
}
