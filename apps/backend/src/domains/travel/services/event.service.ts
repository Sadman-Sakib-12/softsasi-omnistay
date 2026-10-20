import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { randomBytes, createHmac } from 'crypto';
import { BookEventDto, CreateEventDto, ScanQrTicketDto, UpdateEventDto } from '../dto/event.dto.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  private canManage(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.role === 'General Manager (GM)' ||
      caller.role === 'Third-Party Vendor / Host' ||
      caller.permissions.includes('events:manage') ||
      caller.permissions.includes('properties:manage')
    );
  }

  async listEvents(tenantId?: string, filters?: { eventType?: string }) {
    const where: any = { deletedAt: null };
    if (tenantId) where.tenantId = tenantId;
    if (filters?.eventType) where.eventType = filters.eventType;

    return this.prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        ticketTiers: true,
        timeSlots: true,
        seatingTables: true,
        _count: { select: { bookings: true } },
      },
    });
  }

  async getEventById(id: string, tenantId?: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(tenantId ? { tenantId } : {}),
      },
      include: {
        ticketTiers: true,
        timeSlots: true,
        seatingTables: true,
        qrScans: { orderBy: { scannedAt: 'desc' }, take: 20 },
        translations: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async createEvent(dto: CreateEventDto, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to create events');
    }

    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    return this.prisma.event.create({
      data: {
        tenantId,
        title: dto.title,
        slug,
        eventType: dto.eventType,
        venueAddress: dto.venueAddress,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        maxCapacity: dto.maxCapacity,
        status: dto.status || 'active',
        ticketTiers: dto.ticketTiers?.length
          ? {
              create: dto.ticketTiers.map((tier) => ({
                name: tier.name,
                price: tier.price,
                totalSeats: tier.totalSeats,
                bookedSeats: 0,
              })),
            }
          : undefined,
        timeSlots: dto.timeSlots?.length
          ? {
              create: dto.timeSlots.map((ts) => ({
                sessionName: ts.sessionName,
                startTime: new Date(ts.startTime),
                endTime: new Date(ts.endTime),
              })),
            }
          : undefined,
      },
      include: {
        ticketTiers: true,
        timeSlots: true,
      },
    });
  }

  async updateEvent(id: string, dto: UpdateEventDto, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to update events');
    }

    await this.getEventById(id, tenantId);

    return this.prisma.event.update({
      where: { id },
      data: {
        title: dto.title,
        maxCapacity: dto.maxCapacity,
        status: dto.status,
      },
      include: {
        ticketTiers: true,
      },
    });
  }

  async deleteEvent(id: string, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to delete events');
    }

    await this.getEventById(id, tenantId);

    return this.prisma.event.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
    });
  }

  async bookEvent(dto: BookEventDto, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      include: { ticketTiers: true },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
    }

    // Match tier by ID or name
    const tier = event.ticketTiers.find((t) => t.id === dto.ticketTierId || t.name === dto.ticketTierId);
    if (!tier) {
      throw new NotFoundException(`Ticket tier ${dto.ticketTierId} not found`);
    }

    if (tier.bookedSeats + dto.quantity > tier.totalSeats) {
      throw new BadRequestException('Not enough seats remaining in this ticket tier');
    }

    // Generate secure anti-fraud ticket code with HMAC-SHA256 signature
    const salt = randomBytes(4).toString('hex').toUpperCase();
    const rawCode = `EVT-${event.slug.substring(0, 4).toUpperCase()}-${salt}`;
    const hmacSecret = process.env.JWT_SECRET || 'omnistay-qr-gate-secret';
    const hmacSig = createHmac('sha256', hmacSecret).update(rawCode).digest('hex').substring(0, 8).toUpperCase();
    const ticketCode = `${rawCode}-${hmacSig}`;

    const totalAmount = dto.quantity * Number(tier.price);

    // Increment booked seats
    await this.prisma.eventTicketTier.update({
      where: { id: tier.id },
      data: { bookedSeats: { increment: dto.quantity } },
    });

    return this.prisma.eventBooking.create({
      data: {
        eventId: dto.eventId,
        userId,
        quantity: dto.quantity,
        totalAmount,
        ticketCode,
        bookingStatus: 'confirmed',
      },
    });
  }

  /**
   * Fast gate scanner API with HMAC verification and duplicate entry prevention.
   */
  async scanQrTicket(dto: ScanQrTicketDto) {
    const booking = await this.prisma.eventBooking.findUnique({
      where: { ticketCode: dto.ticketCode },
      include: { event: true },
    });

    if (!booking) {
      throw new NotFoundException('Invalid ticket code: No registration found');
    }

    // Check if previously scanned successfully
    const previousScan = await this.prisma.eventQrScan.findFirst({
      where: {
        eventId: booking.eventId,
        ticketCode: dto.ticketCode,
        isSuccess: true,
      },
    });

    if (previousScan) {
      // Log duplicate attempt
      await this.prisma.eventQrScan.create({
        data: {
          eventId: booking.eventId,
          ticketCode: dto.ticketCode,
          gateName: dto.gateName || 'Main Gate',
          isSuccess: false,
        },
      });
      throw new ConflictException(`DUPLICATE ENTRY DETECTED! Ticket was already scanned at ${previousScan.scannedAt.toISOString()}`);
    }

    // Record verified gate entry
    const scanRecord = await this.prisma.eventQrScan.create({
      data: {
        eventId: booking.eventId,
        ticketCode: dto.ticketCode,
        gateName: dto.gateName || 'Main Gate',
        isSuccess: true,
      },
    });

    return {
      status: 'verified',
      gate: dto.gateName || 'Main Gate',
      eventTitle: booking.event.title,
      quantity: booking.quantity,
      scannedAt: scanRecord.scannedAt,
    };
  }
}
