import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { randomBytes } from 'crypto';
import {
  BookFlightDto,
  CreateAirlineDto,
  CreateAirportDto,
  CreateFlightDto,
} from '../dto/flight.dto.js';
import type { AuthenticatedUserPayload } from '../../../common/decorators/current-user.decorator.js';

@Injectable()
export class FlightService {
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
      caller.permissions.includes('flights:manage') ||
      caller.permissions.includes('properties:manage')
    );
  }

  async listAirports() {
    return this.prisma.airport.findMany({
      orderBy: { city: 'asc' },
    });
  }

  async createAirport(dto: CreateAirportDto) {
    return this.prisma.airport.upsert({
      where: { iataCode: dto.iataCode.toUpperCase() },
      update: { name: dto.name, city: dto.city, country: dto.country },
      create: {
        iataCode: dto.iataCode.toUpperCase(),
        name: dto.name,
        city: dto.city,
        country: dto.country,
      },
    });
  }

  async listAirlines() {
    return this.prisma.airline.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createAirline(dto: CreateAirlineDto) {
    return this.prisma.airline.upsert({
      where: { iataCode: dto.iataCode.toUpperCase() },
      update: { name: dto.name, country: dto.country },
      create: {
        name: dto.name,
        iataCode: dto.iataCode.toUpperCase(),
        country: dto.country,
      },
    });
  }

  async listFlights(tenantId?: string, filters?: { originAirportId?: string; destAirportId?: string }) {
    const where: any = { deletedAt: null };
    if (tenantId) where.tenantId = tenantId;
    if (filters?.originAirportId) where.originAirportId = filters.originAirportId;
    if (filters?.destAirportId) where.destAirportId = filters.destAirportId;

    return this.prisma.flight.findMany({
      where,
      orderBy: { departureTime: 'asc' },
      include: {
        airline: true,
        originAirport: true,
        destAirport: true,
        seats: true,
        _count: { select: { bookings: true, passengers: true } },
      },
    });
  }

  async getFlightById(id: string, tenantId?: string) {
    const flight = await this.prisma.flight.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(tenantId ? { tenantId } : {}),
      },
      include: {
        airline: true,
        originAirport: true,
        destAirport: true,
        seats: true,
        passengers: true,
      },
    });

    if (!flight) {
      throw new NotFoundException(`Flight with ID ${id} not found`);
    }
    return flight;
  }

  async createFlight(dto: CreateFlightDto, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to create flights');
    }

    return this.prisma.flight.create({
      data: {
        tenantId,
        flightNumber: dto.flightNumber,
        airlineId: dto.airlineId,
        originAirportId: dto.originAirportId,
        destAirportId: dto.destAirportId,
        departureTime: new Date(dto.departureTime),
        arrivalTime: new Date(dto.arrivalTime),
        aircraftType: dto.aircraftType,
        basePrice: dto.basePrice,
        status: dto.status || 'scheduled',
        seats: dto.seats?.length
          ? {
              create: dto.seats.map((s) => ({
                seatNumber: s.seatNumber,
                cabinClass: s.cabinClass || 'Economy',
                price: s.price,
                isBooked: false,
              })),
            }
          : undefined,
      },
      include: {
        airline: true,
        originAirport: true,
        destAirport: true,
        seats: true,
      },
    });
  }

  async bookFlight(dto: BookFlightDto, userId: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { id: dto.flightId },
      include: { seats: true },
    });

    if (!flight) {
      throw new NotFoundException(`Flight with ID ${dto.flightId} not found`);
    }

    if (!dto.passengers || dto.passengers.length === 0) {
      throw new BadRequestException('At least one passenger manifest required for flight booking');
    }

    // Generate unique flight boarding ticket code
    const ticketCode = `BRD-${flight.flightNumber}-${randomBytes(3).toString('hex').toUpperCase()}`;
    const totalAmount = dto.passengers.length * Number(flight.basePrice);

    // Save passengers in flight manifest
    for (const p of dto.passengers) {
      await this.prisma.flightPassenger.create({
        data: {
          flightId: dto.flightId,
          passportNo: p.passportNo,
          fullName: p.fullName,
          nationality: p.nationality,
          dateOfBirth: new Date(p.dateOfBirth),
          seatNumber: p.seatNumber || null,
        },
      });

      // Mark seat as booked if specified
      if (p.seatNumber) {
        await this.prisma.flightSeat.updateMany({
          where: { flightId: dto.flightId, seatNumber: p.seatNumber },
          data: { isBooked: true },
        });
      }
    }

    return this.prisma.flightBooking.create({
      data: {
        flightId: dto.flightId,
        userId,
        ticketCode,
        totalAmount,
        bookingStatus: 'confirmed',
      },
    });
  }
}
