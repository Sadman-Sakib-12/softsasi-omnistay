import { Inject, Injectable } from '@nestjs/common';
import type { IAiRepository } from '../../domain/repositories/ai.repository.interface.js';
import { AI_REPOSITORY_TOKEN } from '../../domain/repositories/ai.repository.interface.js';
import {
  calculate90DayForecast,
  detectExpenseAnomaly,
} from '../../domain/rules/dynamic-pricing.rule.js';
import {
  PredictiveForecastRequest,
  PredictiveForecastResult,
} from '@omnistay/shared-types';

@Injectable()
export class AiPredictiveAnalyticsService {
  constructor(
    @Inject(AI_REPOSITORY_TOKEN)
    private readonly aiRepo: IAiRepository,
  ) {}

  async generateForecast(req: PredictiveForecastRequest): Promise<PredictiveForecastResult> {
    const forecast = calculate90DayForecast(
      req.totalRooms,
      req.historicalOccupancyRate,
      req.confirmedBookingsCount,
      req.averageDailyRate,
      req.projectedDays || 90,
    );

    const forecastDate = new Date();
    forecastDate.setDate(forecastDate.getDate() + (req.projectedDays || 90));

    await this.aiRepo.createPredictiveForecast({
      propertyId: req.propertyId,
      forecastDate,
      forecastOccupancy: forecast.projectedOccupancy,
      forecastRevenue: forecast.projectedRevenue,
    });

    return {
      propertyId: req.propertyId,
      forecastDate: forecastDate.toISOString().split('T')[0],
      forecastOccupancy: forecast.projectedOccupancy,
      forecastRevenue: forecast.projectedRevenue,
      projectedRevPAR: forecast.projectedRevPAR,
    };
  }

  async checkExpenseAnomaly(data: {
    historicalAverageExpense: number;
    currentExpense: number;
    thresholdMultiplier?: number;
  }) {
    return detectExpenseAnomaly(
      data.historicalAverageExpense,
      data.currentExpense,
      data.thresholdMultiplier || 1.5,
    );
  }

  async getPropertyForecasts(propertyId: string) {
    return this.aiRepo.findPredictiveForecasts(propertyId);
  }
}
