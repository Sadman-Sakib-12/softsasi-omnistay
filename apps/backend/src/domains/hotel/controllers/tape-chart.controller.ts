import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TapeChartService } from '../services/tape-chart.service.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Front Desk Tape Chart & Reservations Matrix')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/rooms')
export class TapeChartController {
  constructor(private readonly tapeChartService: TapeChartService) {}

  @Get('tape-chart')
  @ApiOperation({
    summary: 'Fetch front-desk visual tape chart matrix',
    description:
      'Retrieves the real-time visual timeline showing rooms vertically and 30-day calendar dates horizontally with color-coded reservation blocks and cleanliness telemetry.',
  })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Optional property UUID' })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-10-19', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'days', required: false, example: 30, description: 'Number of calendar days (default 30)' })
  @ApiResponse({ status: 200, description: 'Tape chart matrix returned successfully' })
  @ApiResponse({ status: 403, description: 'Access forbidden: Front Desk or GM role required' })
  async getTapeChart(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('propertyId') propertyId?: string,
    @Query('startDate') startDate?: string,
    @Query('days') days?: number,
  ) {
    const targetPropertyId = propertyId || '';
    return this.tapeChartService.getTapeChartData(
      targetPropertyId,
      startDate,
      days ? Number(days) : 30,
      user.organizationId,
      user,
    );
  }
}
