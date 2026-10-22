import { Inject, Injectable } from '@nestjs/common';
import type { IAiRepository } from '../../domain/repositories/ai.repository.interface.js';
import { AI_REPOSITORY_TOKEN } from '../../domain/repositories/ai.repository.interface.js';
import {
  calculateSurgePricing,
  DynamicPricingEvaluationResult,
} from '../../domain/rules/dynamic-pricing.rule.js';
import {
  EvaluateDynamicPricingRequest,
  DynamicPricingResult,
} from '@omnistay/shared-types';

@Injectable()
export class DynamicYieldPricingService {
  constructor(
    @Inject(AI_REPOSITORY_TOKEN)
    private readonly aiRepo: IAiRepository,
  ) {}

  async evaluateRate(req: EvaluateDynamicPricingRequest): Promise<DynamicPricingResult> {
    const evaluation: DynamicPricingEvaluationResult = calculateSurgePricing(
      req.baseRate,
      req.currentOccupancyPct,
      req.daysUntilArrival,
      req.competitorAverageRate,
    );

    // Persist evaluation log for revenue management audits
    await this.aiRepo.createDynamicPricingLog({
      roomTypeId: req.roomTypeId,
      originalRate: evaluation.originalRate,
      suggestedRate: evaluation.suggestedRate,
      appliedRate: evaluation.appliedRate,
      occupancyPct: req.currentOccupancyPct,
    });

    return {
      roomTypeId: req.roomTypeId,
      originalRate: evaluation.originalRate,
      suggestedRate: evaluation.suggestedRate,
      appliedRate: evaluation.appliedRate,
      surgeMultiplier: evaluation.surgeMultiplier,
      adjustmentReason: evaluation.adjustmentReason,
      isLastMinuteDiscount: evaluation.isLastMinuteDiscount,
    };
  }

  async getPricingLogs(roomTypeId: string, limit: number = 20) {
    return this.aiRepo.findDynamicPricingLogs(roomTypeId, limit);
  }

  async recordCompetitorRate(data: {
    propertyId: string;
    competitorName: string;
    roomCategory: string;
    rateObserved: number;
  }) {
    return this.aiRepo.createCompetitorPriceScrape(data);
  }

  async getCompetitorScrapes(propertyId: string) {
    return this.aiRepo.findCompetitorPriceScrapes(propertyId);
  }
}
