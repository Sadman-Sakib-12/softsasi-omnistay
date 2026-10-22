import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { DynamicYieldPricingService } from '../../application/services/dynamic-pricing.service.js';

@ApiTags('AI - Dynamic Yield & Revenue Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/ai/pricing')
export class DynamicPricingController {
  constructor(private readonly dynamicPricingService: DynamicYieldPricingService) {}

  @Post('evaluate')
  @ApiOperation({ summary: 'Compute real-time dynamic surge rate and tactical last-minute discounts' })
  evaluateRate(@Body() body: {
    roomTypeId: string;
    baseRate: number;
    currentOccupancyPct: number;
    daysUntilArrival: number;
    competitorAverageRate?: number;
  }) {
    return this.dynamicPricingService.evaluateRate(body);
  }

  @Get('logs/:roomTypeId')
  @ApiOperation({ summary: 'Retrieve historical dynamic pricing logs for room category' })
  getLogs(
    @Param('roomTypeId') roomTypeId: string,
    @Query('limit') limit?: number,
  ) {
    return this.dynamicPricingService.getPricingLogs(roomTypeId, limit ? Number(limit) : 20);
  }

  @Post('competitor-scrape')
  @ApiOperation({ summary: 'Ingest external 5-mile radius competitor rate benchmarks' })
  recordCompetitorRate(@Body() body: {
    propertyId: string;
    competitorName: string;
    roomCategory: string;
    rateObserved: number;
  }) {
    return this.dynamicPricingService.recordCompetitorRate(body);
  }

  @Get('competitor-scrapes/:propertyId')
  @ApiOperation({ summary: 'Retrieve competitor pricing benchmarks for property' })
  getCompetitorScrapes(@Param('propertyId') propertyId: string) {
    return this.dynamicPricingService.getCompetitorScrapes(propertyId);
  }
}
