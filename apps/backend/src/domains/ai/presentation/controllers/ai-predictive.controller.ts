import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiPredictiveAnalyticsService } from '../../application/services/ai-predictive.service.js';

@ApiTags('AI - Predictive Analytics & Forecasting')
@Controller('api/v1/ai/predictive')
export class AiPredictiveController {
  constructor(private readonly predictiveService: AiPredictiveAnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get 90-day predictive forecasts, cash flow runway, and expense anomaly detection' })
  getOverview(@Query('propertyId') propertyId?: string) {
    return this.predictiveService.getPredictiveOverview(propertyId);
  }

  @Post('forecast')
  @ApiOperation({ summary: 'Compute 90-day predictive occupancy percentage and RevPAR runway' })
  generateForecast(@Body() body: {
    propertyId: string;
    totalRooms: number;
    historicalOccupancyRate: number;
    confirmedBookingsCount: number;
    averageDailyRate: number;
    projectedDays?: number;
  }) {
    return this.predictiveService.generateForecast(body);
  }

  @Post('anomaly-check')
  @ApiOperation({ summary: 'Detect departmental expense anomalies using historical baseline thresholds' })
  checkAnomaly(@Body() body: {
    historicalAverageExpense: number;
    currentExpense: number;
    thresholdMultiplier?: number;
  }) {
    return this.predictiveService.checkExpenseAnomaly(body);
  }

  @Get('forecasts/:propertyId')
  @ApiOperation({ summary: 'Retrieve historical predictive forecasts for property' })
  getForecasts(@Param('propertyId') propertyId: string) {
    return this.predictiveService.getPropertyForecasts(propertyId);
  }
}
