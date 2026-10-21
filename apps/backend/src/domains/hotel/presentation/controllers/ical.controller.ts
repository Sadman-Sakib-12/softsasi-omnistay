import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IcalService } from '../../application/services/ical.service.js';
import { CreateIcalFeedDto } from '../dto/ical.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { Public } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('iCal & Multi-Channel Synchronization')
@Controller('api/v1')
export class IcalController {
  constructor(private readonly icalService: IcalService) {}

  @ApiBearerAuth('JWT-Auth')
  @UseGuards(JwtAuthGuard)
  @Post('room-types/:roomTypeId/ical/feeds')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register iCal synchronization channel',
    description: 'Binds an external OTA iCal feed URL (Airbnb, VRBO, Booking.com) and provisions tokenized outbound feed.',
  })
  @ApiParam({ name: 'roomTypeId', description: 'RoomType UUID' })
  @ApiResponse({ status: 201, description: 'iCal feed created' })
  async createIcalFeed(
    @Param('roomTypeId') roomTypeId: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateIcalFeedDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.icalService.createIcalFeed(roomTypeId, dto, user.organizationId || '', user);
  }

  @ApiBearerAuth('JWT-Auth')
  @UseGuards(JwtAuthGuard)
  @Get('room-types/:roomTypeId/ical/feeds')
  @ApiOperation({
    summary: 'List configured iCal feeds',
    description: 'Retrieves all active calendar feeds for the room type with sync timestamps.',
  })
  @ApiParam({ name: 'roomTypeId', description: 'RoomType UUID' })
  @ApiResponse({ status: 200, description: 'List of iCal feeds' })
  async listIcalFeeds(
    @Param('roomTypeId') roomTypeId: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.icalService.listIcalFeeds(roomTypeId, user.organizationId);
  }

  @ApiBearerAuth('JWT-Auth')
  @UseGuards(JwtAuthGuard)
  @Post('ical/sync/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger 2-way iCal synchronization',
    description: 'Executes instantaneous synchronization polling external feed and pushing active reservation blocks.',
  })
  @ApiParam({ name: 'id', description: 'IcalFeed UUID' })
  @ApiResponse({ status: 200, description: 'Synchronization completed' })
  async syncIcalFeed(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.icalService.syncIcalFeed(id, user.organizationId || '', user);
  }

  @Public()
  @Get('ical/export/:token.ics')
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  @Header('Content-Disposition', 'inline; filename="calendar.ics"')
  @ApiOperation({
    summary: 'Export RFC 5545 iCal calendar feed',
    description: 'Generates real-time RFC 5545 compliant `.ics` calendar feed containing blackout reservation blocks for OTAs.',
  })
  @ApiParam({ name: 'token', description: 'Unique secure feed token' })
  @ApiResponse({ status: 200, description: 'RFC 5545 compliant iCal payload' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async exportIcs(@Param('token') token: string): Promise<string> {
    return this.icalService.generateOutboundIcs(token);
  }
}
