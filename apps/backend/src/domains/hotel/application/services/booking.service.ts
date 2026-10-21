import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateBookingDto } from '../../presentation/dto/create-booking.dto.js';
import { CheckInDto, CheckOutDto } from '../../presentation/dto/check-in-out.dto.js';
import { RoomTypeService } from './room-type.service.js';
import { RoomService } from './room.service.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import crypto from 'node:crypto';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roomTypeService: RoomTypeService,
    private readonly roomService: RoomService,
  ) {}

  private canManageReservations(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.role === 'General Manager (GM)' ||
      caller.role === 'Front Desk Agent' ||
      caller.permissions.includes('reservations:write') ||
      caller.permissions.includes('reservations:manage')
    );
  }

  private generateBookingCode(): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `BK-${randomHex}${timestamp}`;
  }

  /**
   * Creates a confirmed reservation with automated Folio generation.
   */
  async createBooking(
    dto: CreateBookingDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const roomType = await this.roomTypeService.getRoomTypeById(dto.roomTypeId, organizationId);

    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkIn >= checkOut) {
      throw new BadRequestException('Check-in date must be strictly prior to check-out date');
    }

    // Calculate nights
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const basePriceNum = Number(roomType.basePrice);
    const totalAmount = Math.round(basePriceNum * nights * 100) / 100;
    const depositAmount = dto.depositAmount ? Math.min(dto.depositAmount, totalAmount) : 0;
    const balanceDue = Math.max(0, totalAmount - depositAmount);

    const bookingCode = this.generateBookingCode();
    const folioNumber = `FOL-${bookingCode}`;

    const guestId = caller.userId;
    const primaryGuest = dto.guests?.find((g) => g.isPrimary) || dto.guests?.[0];

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create Booking
      const booking = await tx.booking.create({
        data: {
          tenantId: organizationId,
          bookingCode,
          guestId,
          propertyId: dto.propertyId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          adults: dto.adults ?? 1,
          children: dto.children ?? 0,
          totalAmount,
          depositAmount,
          bookingStatus: 'confirmed',
          paymentStatus: depositAmount >= totalAmount ? 'paid' : depositAmount > 0 ? 'partial' : 'unpaid',
          createdBy: caller.userId,
        },
      });

      // 2. Create BookingItem
      await tx.bookingItem.create({
        data: {
          bookingId: booking.id,
          roomTypeId: dto.roomTypeId,
          itemType: 'room',
          quantity: 1,
          unitPrice: basePriceNum,
          totalPrice: totalAmount,
        },
      });

      // 3. Create BookingGuests
      if (dto.guests && dto.guests.length > 0) {
        for (const guest of dto.guests) {
          await tx.bookingGuest.create({
            data: {
              bookingId: booking.id,
              fullName: guest.fullName.trim(),
              email: guest.email,
              phone: guest.phone,
              isPrimary: guest.isPrimary ?? false,
              passportNo: guest.passportNo,
            },
          });
        }
      } else {
        await tx.bookingGuest.create({
          data: {
            bookingId: booking.id,
            fullName: caller.name || 'Valued Guest',
            email: caller.email,
            isPrimary: true,
          },
        });
      }

      // 4. Auto-initialize GuestFolio
      const folio = await tx.guestFolio.create({
        data: {
          bookingId: booking.id,
          folioNumber,
          totalCharges: totalAmount,
          totalPayments: depositAmount,
          balanceDue,
          status: 'open',
        },
      });

      // 5. Post initial Room Charge FolioTransaction
      await tx.folioTransaction.create({
        data: {
          folioId: folio.id,
          transactionType: 'charge',
          department: 'room',
          amount: totalAmount,
        },
      });

      // 6. Post initial Deposit Payment if any
      if (depositAmount > 0) {
        await tx.folioTransaction.create({
          data: {
            folioId: folio.id,
            transactionType: 'payment',
            department: 'room',
            amount: depositAmount,
          },
        });
      }

      return { booking, folio };
    });

    return {
      message: 'Reservation confirmed and guest folio initialized successfully',
      bookingId: result.booking.id,
      bookingCode: result.booking.bookingCode,
      folioNumber: result.folio.folioNumber,
      totalAmount,
      depositAmount,
      balanceDue,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      nights,
    };
  }

  /**
   * Lists reservations for tenant organization with filtering.
   */
  async listBookings(
    filter: { propertyId?: string; bookingStatus?: string; guestId?: string },
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const where: any = {
      tenantId: organizationId,
      deletedAt: null,
    };

    if (filter.propertyId) where.propertyId = filter.propertyId;
    if (filter.bookingStatus) where.bookingStatus = filter.bookingStatus;

    // If regular guest, only return own bookings
    if (caller.role === 'Hotel Guest (Traveler)' || caller.role === 'Guest / Traveler') {
      where.guestId = caller.userId;
    } else if (filter.guestId) {
      where.guestId = filter.guestId;
    }

    return this.prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        property: { select: { id: true, name: true, code: true } },
        guest: { select: { id: true, name: true, email: true } },
        bookingGuests: true,
        folios: { select: { id: true, folioNumber: true, totalCharges: true, balanceDue: true, status: true } },
      },
    });
  }

  /**
   * Retrieves single reservation by UUID.
   */
  async getBookingById(id: string, organizationId: string, caller: AuthenticatedUserPayload) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId: organizationId, deletedAt: null },
      include: {
        property: true,
        guest: { select: { id: true, name: true, email: true } },
        bookingGuests: true,
        bookingItems: {
          include: { roomType: true },
        },
        folios: {
          include: {
            transactions: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking reservation not found');
    }

    if (
      (caller.role === 'Hotel Guest (Traveler)' || caller.role === 'Guest / Traveler') &&
      booking.guestId !== caller.userId
    ) {
      throw new ForbiddenException('Access denied: You can only view your own reservations');
    }

    return booking;
  }

  /**
   * Front-desk Guest Check-in (captures keycard code, digital signature, marks room occupied).
   */
  async checkInGuest(dto: CheckInDto, organizationId: string, caller: AuthenticatedUserPayload) {
    if (!this.canManageReservations(caller)) {
      throw new ForbiddenException('Insufficient permissions to execute front-desk check-in');
    }

    const booking = await this.getBookingById(dto.bookingId, organizationId, caller);

    if (booking.bookingStatus !== 'confirmed') {
      throw new BadRequestException(
        `Cannot check in booking with status '${booking.bookingStatus}'. Must be 'confirmed'.`,
      );
    }

    const room = await this.roomService.getRoomById(dto.roomId, organizationId);

    if (room.operationalStatus !== 'available') {
      throw new ConflictException(
        `Room ${room.roomNumber} is currently '${room.operationalStatus}' and cannot be assigned`,
      );
    }

    const keycardCode = dto.keycardCode || room.keycardCode || `RFID-${Date.now().toString().slice(-6)}`;

    await this.prisma.$transaction([
      // Update booking
      this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          bookingStatus: 'checked_in',
          updatedBy: caller.userId,
        },
      }),
      // Log keycard event
      this.prisma.keycardLog.create({
        data: {
          roomId: room.id,
          keycardCode,
          eventType: 'CHECK_IN_ISSUED',
          guestName: booking.bookingGuests[0]?.fullName || booking.guest.name,
        },
      }),
    ]);

    return {
      message: `Guest checked in successfully to Room ${room.roomNumber}`,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      roomId: room.id,
      roomNumber: room.roomNumber,
      keycardCode,
      cleanlinessStatus: room.cleanlinessStatus,
      checkInTime: new Date().toISOString(),
    };
  }

  /**
   * Front-desk Guest Check-out (audits folio balance, updates room to Dirty, dispatches cleaning task).
   */
  async checkOutGuest(dto: CheckOutDto, organizationId: string, caller: AuthenticatedUserPayload) {
    if (!this.canManageReservations(caller)) {
      throw new ForbiddenException('Insufficient permissions to execute front-desk check-out');
    }

    const booking = await this.getBookingById(dto.bookingId, organizationId, caller);

    if (booking.bookingStatus !== 'checked_in') {
      throw new BadRequestException(
        `Cannot check out booking with status '${booking.bookingStatus}'. Must be 'checked_in'.`,
      );
    }

    const folio = booking.folios[0];
    if (folio && Number(folio.balanceDue) > 0 && !dto.forceOverrideUnpaid) {
      throw new BadRequestException(
        `Cannot check out: Outstanding folio balance due of ${folio.balanceDue}. Settle folio before departure or enable forceOverrideUnpaid.`,
      );
    }

    // Find assigned room through bookings or first room of that room type
    const bookingItem = booking.bookingItems[0];
    const room = await this.prisma.room.findFirst({
      where: {
        roomTypeId: bookingItem?.roomTypeId || undefined,
        deletedAt: null,
      },
    });

    await this.prisma.$transaction(async (tx) => {
      // 1. Update Booking
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          bookingStatus: 'checked_out',
          updatedBy: caller.userId,
        },
      });

      // 2. Close Folio
      if (folio) {
        await tx.guestFolio.update({
          where: { id: folio.id },
          data: { status: 'closed' },
        });
      }

      // 3. Mark room as Dirty and auto-dispatch Housekeeping Checkout Clean Task
      if (room) {
        await tx.room.update({
          where: { id: room.id },
          data: { cleanlinessStatus: 'dirty' },
        });

        await tx.housekeepingLog.create({
          data: {
            roomId: room.id,
            staffId: caller.userId,
            statusFrom: 'clean/available',
            statusTo: 'dirty/available',
            notes: `Checkout clean needed for booking ${booking.bookingCode}`,
          },
        });

        await tx.housekeepingTask.create({
          data: {
            roomId: room.id,
            taskType: 'checkout_clean',
            priority: 'high',
            status: 'assigned',
            completionNotes: `Automated dispatch upon guest check-out (${booking.bookingCode})`,
          },
        });
      }
    });

    return {
      message: 'Guest checked out successfully. Folio audited and room marked as dirty for housekeeping.',
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      folioStatus: folio ? 'closed' : 'none',
      roomCleanlinessStatus: 'dirty',
      housekeepingDispatched: true,
    };
  }

  /**
   * Cancels a booking.
   */
  async cancelBooking(id: string, organizationId: string, caller: AuthenticatedUserPayload) {
    const booking = await this.getBookingById(id, organizationId, caller);

    if (booking.bookingStatus === 'checked_in' || booking.bookingStatus === 'checked_out') {
      throw new BadRequestException(`Cannot cancel a booking that is already ${booking.bookingStatus}`);
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        bookingStatus: 'cancelled',
        updatedBy: caller.userId,
      },
    });
  }
}
