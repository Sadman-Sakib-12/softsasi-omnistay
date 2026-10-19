import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RateCalendarService } from '../services/rate-calendar.service.js';
import {
  CreateRatePlanDto,
  CreateSeasonalRateDto,
  SetRoomAvailabilityDto,
} from '../dto/rate-calendar.dto.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUserPayload } from '../../../common/decorators/current-user.decorator.js';

@ApiTags('Dynamic Pricing, Rate Plans & Availability Calendar')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1')
export class RateCalendarController {
  constructor(private readonly rateCalendarService: RateCalendarService) {}

  @Post('properties/:propertyId/rate-plans')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create rate plan',
    description: 'Defines a commercial rate plan (e.g. BAR, Non-Refundable, Bed & Breakfast).',
  })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({ status: 201, description: 'Rate plan created' })
  async createRatePlan(
    @Param('propertyId') propertyId: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateRatePlanDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.rateCalendarService.createRatePlan(propertyId, dto, user.organizationId || '', user);
  }

  @Get('properties/:propertyId/rate-plans')
  @ApiOperation({
    summary: 'List active rate plans',
    description: 'Retrieves all available rate plans configured for the property.',
  })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({ status: 200, description: 'List of rate plans' })
  async listRatePlans(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.rateCalendarService.listRatePlans(propertyId, user.organizationId);
  }

  @Post('properties/:propertyId/seasonal-rates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create seasonal date multiplier',
    description: 'Sets a high/low seasonal multiplier (e.g. Summer Peak +35%) across calendar date bands.',
  })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({ status: 201, description: 'Seasonal rate configured' })
  async createSeasonalRate(
    @Param('propertyId') propertyId: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateSeasonalRateDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.rateCalendarService.createSeasonalRate(propertyId, dto, user.organizationId || '', user);
  }

  @Get('properties/:propertyId/seasonal-rates')
  @ApiOperation({
    summary: 'List seasonal rates',
    description: 'Retrieves all configured seasonal rate multipliers for the property.',
  })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({ status: 200, description: 'List of seasonal rates' })
  async listSeasonalRates(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.rateCalendarService.listSeasonalRates(propertyId, user.organizationId);
  }

  @Post('room-types/:roomTypeId/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Batch set room availability and dynamic rates',
    description: 'Configures daily inventory counts, dynamic rates, and min/max stay restrictions for date ranges.',
  })
  @ApiParam({ name: 'roomTypeId', description: 'RoomType UUID' })
  @ApiResponse({ status: 200, description: 'Availability and rates updated' })
  async setAvailabilityBlock(
    @Param('roomTypeId') roomTypeId: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: SetRoomAvailabilityDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.rateCalendarService.setAvailabilityBlock(roomTypeId, dto, user.organizationId || '', user);
  }

  @Get('room-types/:roomTypeId/availability')
  @ApiOperation({
    summary: 'Query room availability calendar grid',
    description: 'Calculates day-by-day availability, dynamic prices, and booking limits over a date window.',
  })
  @ApiParam({ name: 'roomTypeId', description: 'RoomType UUID' })
  @ApiQuery({ name: 'startDate', required: true, example: '2026-11-01', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, example: '2026-11-30', description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Daily availability grid' })
  async getAvailabilityGrid(
    @Param('roomTypeId') roomTypeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.rateCalendarService.getAvailabilityGrid(roomTypeId, startDate, endDate, user.organizationId);
  }
}
