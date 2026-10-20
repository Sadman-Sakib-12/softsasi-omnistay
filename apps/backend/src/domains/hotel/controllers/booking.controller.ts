import {
  Body,
  Controller,
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
import { BookingService } from '../services/booking.service.js';
import { CreateBookingDto } from '../dto/create-booking.dto.js';
import { CheckInDto, CheckOutDto } from '../dto/check-in-out.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Reservations & Front-Desk Check-In/Out')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('bookings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create reservation booking',
    description: 'Places a confirmed room reservation and automatically provisions an open guest folio.',
  })
  @ApiResponse({ status: 201, description: 'Reservation confirmed and folio created' })
  async createBooking(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateBookingDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.bookingService.createBooking(dto, user.organizationId || '', user);
  }

  @Get('bookings')
  @ApiOperation({
    summary: 'List reservations',
    description: 'Retrieves bookings filtered by property, status, or guest account.',
  })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Property UUID' })
  @ApiQuery({ name: 'bookingStatus', required: false, description: 'confirmed, checked_in, checked_out, cancelled' })
  @ApiQuery({ name: 'guestId', required: false, description: 'Filter by specific guest user UUID' })
  @ApiResponse({ status: 200, description: 'List of reservations' })
  async listBookings(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('propertyId') propertyId?: string,
    @Query('bookingStatus') bookingStatus?: string,
    @Query('guestId') guestId?: string,
  ) {
    return this.bookingService.listBookings(
      { propertyId, bookingStatus, guestId },
      user.organizationId || '',
      user,
    );
  }

  @Get('bookings/:id')
  @ApiOperation({
    summary: 'Get reservation details',
    description: 'Fetches reservation breakdown, guest list, room category, and financial folio ledger.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking profile' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBooking(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.bookingService.getBookingById(id, user.organizationId || '', user);
  }

  @Patch('bookings/:id/cancel')
  @ApiOperation({
    summary: 'Cancel reservation',
    description: 'Cancels a pending or confirmed booking.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  async cancelBooking(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.bookingService.cancelBooking(id, user.organizationId || '', user);
  }

  // --- Front Desk Check-in / Check-out Endpoints (OpenAPI 3.1 Spec) ---

  @Post('rooms/check-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Front-desk guest check-in',
    description: 'Checks in guest, captures digital signature, programs RFID/BLE door key, and updates status to checked_in.',
  })
  @ApiResponse({ status: 200, description: 'Guest successfully checked in' })
  @ApiResponse({ status: 400, description: 'Booking is not confirmed or room is unavailable' })
  async checkIn(
    @Body(new ValidationPipe({ whitelist: true })) dto: CheckInDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.bookingService.checkInGuest(dto, user.organizationId || '', user);
  }

  @Post('rooms/check-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Front-desk guest check-out',
    description: 'Audits folio, verifies payment settlement, marks room as Dirty, and dispatches housekeeping task.',
  })
  @ApiResponse({ status: 200, description: 'Guest successfully checked out' })
  @ApiResponse({ status: 400, description: 'Outstanding unpaid balance on folio' })
  async checkOut(
    @Body(new ValidationPipe({ whitelist: true })) dto: CheckOutDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.bookingService.checkOutGuest(dto, user.organizationId || '', user);
  }
}
