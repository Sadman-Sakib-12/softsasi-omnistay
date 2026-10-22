import { Inject, Injectable } from '@nestjs/common';
import type { IAiRepository } from '../../domain/repositories/ai.repository.interface.js';
import { AI_REPOSITORY_TOKEN } from '../../domain/repositories/ai.repository.interface.js';
import {
  GenerateMarketingCopyRequest,
  MarketingCopyResult,
} from '@omnistay/shared-types';

@Injectable()
export class AiMarketingStudioService {
  constructor(
    @Inject(AI_REPOSITORY_TOKEN)
    private readonly aiRepo: IAiRepository,
  ) {}

  async generateMarketingCopy(req: GenerateMarketingCopyRequest): Promise<MarketingCopyResult> {
    const highlightsText = req.highlights.join(', ');
    let copy = '';
    let subject = '';

    switch (req.tone) {
      case 'Luxury':
        subject = `Experience Opulence: An Exclusive Invitation to ${req.title}`;
        copy = `Indulge in unmatched refinement. Enjoy curated excellence featuring ${highlightsText}. Immerse yourself in bespoke tranquility designed exclusively for discerning travelers.`;
        break;
      case 'Romantic':
        subject = `A Romantic Escape for Two: ${req.title}`;
        copy = `Create unforgettable memories together with romantic sunset vistas, private candlelit dining, and ${highlightsText}. Your dream getaway awaits.`;
        break;
      case 'Family':
        subject = `The Ultimate Family Vacation: ${req.title}`;
        copy = `Fun, connection, and relaxation for all ages! Discover spacious suites, kid-friendly excursions, and ${highlightsText}. Book now for special family packages.`;
        break;
      case 'Business':
      default:
        subject = `Seamless Productivity Meets Elegance: ${req.title}`;
        copy = `Elevate your corporate journey with high-speed connectivity, executive lounges, quiet workspaces, and ${highlightsText}. Prime convenience meets world-class hospitality.`;
        break;
    }

    if (req.channel === 'sms') {
      copy = copy.slice(0, 155) + '... Book now: https://omnistay.com';
    }

    const campaign = await this.aiRepo.createMarketingCampaign({
      tenantId: req.tenantId,
      title: req.title,
      generatedAd: copy,
      targetAudience: req.targetAudience,
      channel: req.channel,
    });

    return {
      title: req.title,
      campaignId: campaign.id,
      generatedCopy: copy,
      suggestedSubjectLine: subject,
      characterCount: copy.length,
      tone: req.tone,
    };
  }

  async getCampaigns(tenantId: string) {
    return this.aiRepo.findMarketingCampaigns(tenantId);
  }
}
