import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { EventService } from '../services/event.service.js';
import { BookEventDto, CreateEventDto, ScanQrTicketDto, UpdateEventDto } from '../dto/event.dto.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUserPayload } from '../../../common/decorators/current-user.decorator.js';

@ApiTags('Event Ticketing & Conferences')
@Controller('api/v1/events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOperation({ summary: 'List events & summits' })
  @ApiQuery({ name: 'eventType', required: false })
  async listEvents(
    @Query('eventType') eventType?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.eventService.listEvents(tenantId, { eventType });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  async getEvent(@Param('id') id: string) {
    return this.eventService.getEventById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new event & ticketing tiers' })
  async createEvent(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateEventDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.eventService.createEvent(dto, user.organizationId || '', user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiOperation({ summary: 'Update event metadata' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  async updateEvent(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateEventDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.eventService.updateEvent(id, dto, user.organizationId || '', user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiOperation({ summary: 'Archive event' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  async deleteEvent(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.eventService.deleteEvent(id, user.organizationId || '', user);
  }

  @Post('book')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book event tickets' })
  async bookEvent(
    @Body(new ValidationPipe({ whitelist: true })) dto: BookEventDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.eventService.bookEvent(dto, user.userId);
  }

  @Post('scan-qr')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gate QR scanner check-in',
    description: 'High-speed gate verification with HMAC-SHA256 signature and anti-fraud duplicate detection.',
  })
  async scanQrTicket(@Body(new ValidationPipe({ whitelist: true })) dto: ScanQrTicketDto) {
    return this.eventService.scanQrTicket(dto);
  }
}
