import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { ITravelRepository } from '../../domain/repositories/travel.repository.interface.js';

@Injectable()
export class PrismaTravelRepository implements ITravelRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Cart
  async findCartBySession(sessionId: string): Promise<any | null> {
    return this.prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });
  }

  async createCart(data: any): Promise<any> {
    return this.prisma.cart.create({
      data,
      include: { items: true },
    });
  }

  async updateCart(sessionId: string, data: any): Promise<any> {
    return this.prisma.cart.update({
      where: { sessionId },
      data,
    });
  }

  async createCartItem(data: any): Promise<any> {
    return this.prisma.cartItem.create({ data });
  }

  async updateCartItem(id: string, data: any): Promise<any> {
    return this.prisma.cartItem.update({
      where: { id },
      data,
    });
  }

  async deleteCartItem(id: string, cartId: string): Promise<any> {
    return this.prisma.cartItem.deleteMany({
      where: { id, cartId },
    });
  }

  async clearCartItems(cartId: string): Promise<any> {
    return this.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

  async createTravelVoucher(data: any): Promise<any> {
    return this.prisma.travelVoucher.create({ data });
  }

  // Spaces
  async findSpaces(tenantId?: string, filters: Record<string, any> = {}): Promise<any[]> {
    const where: any = { deletedAt: null, ...filters };
    if (tenantId) where.tenantId = tenantId;
    return this.prisma.space.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        extraServices: true,
        specs: true,
        _count: { select: { bookings: true } },
      },
    });
  }

  async findSpaceById(id: string, tenantId?: string): Promise<any | null> {
    return this.prisma.space.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(tenantId ? { tenantId } : {}),
      },
      include: {
        extraServices: true,
        specs: true,
        dates: { where: { isClosed: false } },
        translations: true,
      },
    });
  }

  async createSpace(data: any): Promise<any> {
    return this.prisma.space.create({ data });
  }

  async updateSpace(id: string, data: any): Promise<any> {
    return this.prisma.space.update({
      where: { id },
      data,
    });
  }

  async createSpaceBooking(data: any): Promise<any> {
    return this.prisma.spaceBooking.create({ data });
  }

  // Tours
  async findTours(tenantId?: string, filters: Record<string, any> = {}): Promise<any[]> {
    const where: any = { deletedAt: null, ...filters };
    if (tenantId) where.tenantId = tenantId;
    return this.prisma.tour.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        extraServices: true,
        includes: true,
        excludes: true,
        itineraries: true,
        _count: { select: { bookings: true } },
      },
    });
  }

  async findTourById(id: string, tenantId?: string): Promise<any | null> {
    return this.prisma.tour.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(tenantId ? { tenantId } : {}),
      },
      include: {
        extraServices: true,
        includes: true,
        excludes: true,
        itineraries: true,
        dates: { where: { isClosed: false } },
        translations: true,
      },
    });
  }

  async createTour(data: any): Promise<any> {
    return this.prisma.tour.create({ data });
  }

  async updateTour(id: string, data: any): Promise<any> {
    return this.prisma.tour.update({
      where: { id },
      data,
    });
  }

  async createTourBooking(data: any): Promise<any> {
    return this.prisma.tourBooking.create({ data });
  }

  // Cars
  async findCars(tenantId?: string, filters: Record<string, any> = {}): Promise<any[]> {
    const where: any = { deletedAt: null, ...filters };
    if (tenantId) where.tenantId = tenantId;
    return this.prisma.car.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        extraServices: true,
        pickupLocations: true,
        specs: true,
        _count: { select: { bookings: true } },
      },
    });
  }

  async findCarById(id: string, tenantId?: string): Promise<any | null> {
    return this.prisma.car.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(tenantId ? { tenantId } : {}),
      },
      include: {
        extraServices: true,
        pickupLocations: true,
        specs: true,
        dates: { where: { isClosed: false } },
        translations: true,
      },
    });
  }

  async createCar(data: any): Promise<any> {
    return this.prisma.car.create({ data });
  }

  async updateCar(id: string, data: any): Promise<any> {
    return this.prisma.car.update({
      where: { id },
      data,
    });
  }

  async createCarBooking(data: any): Promise<any> {
    return this.prisma.carBooking.create({ data });
  }

  // Boats
  async findBoats(tenantId?: string, filters: Record<string, any> = {}): Promise<any[]> {
    const where: any = { deletedAt: null, ...filters };
    if (tenantId) where.tenantId = tenantId;
    return this.prisma.boat.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        extraServices: true,
        specs: true,
        _count: { select: { bookings: true } },
      },
    });
  }

  async findBoatById(id: string, tenantId?: string): Promise<any | null> {
    return this.prisma.boat.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(tenantId ? { tenantId } : {}),
      },
      include: {
        extraServices: true,
        specs: true,
        dates: { where: { isClosed: false } },
        translations: true,
      },
    });
  }

  async createBoat(data: any): Promise<any> {
    return this.prisma.boat.create({ data });
  }

  async updateBoat(id: string, data: any): Promise<any> {
    return this.prisma.boat.update({
      where: { id },
      data,
    });
  }

  async createBoatBooking(data: any): Promise<any> {
    return this.prisma.boatBooking.create({ data });
  }

  // Events
  async findEvents(tenantId?: string, filters: Record<string, any> = {}): Promise<any[]> {
    const where: any = { deletedAt: null, ...filters };
    if (tenantId) where.tenantId = tenantId;
    return this.prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        ticketTiers: true,
        _count: { select: { bookings: true } },
      },
    });
  }

  async findEventById(id: string, tenantId?: string): Promise<any | null> {
    return this.prisma.event.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(tenantId ? { tenantId } : {}),
      },
      include: {
        ticketTiers: true,
        dates: { where: { isClosed: false } },
        translations: true,
      },
    });
  }

  async createEvent(data: any): Promise<any> {
    return this.prisma.event.create({ data });
  }

  async updateEvent(id: string, data: any): Promise<any> {
    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async createEventBooking(data: any): Promise<any> {
    return this.prisma.eventBooking.create({ data });
  }

  // Flights
  async findAirports(): Promise<any[]> {
    return this.prisma.airport.findMany({
      orderBy: { city: 'asc' },
    });
  }

  async upsertAirport(data: any): Promise<any> {
    return this.prisma.airport.upsert({
      where: { iataCode: data.iataCode.toUpperCase() },
      update: { name: data.name, city: data.city, country: data.country },
      create: {
        iataCode: data.iataCode.toUpperCase(),
        name: data.name,
        city: data.city,
        country: data.country,
      },
    });
  }

  async findAirlines(): Promise<any[]> {
    return this.prisma.airline.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async upsertAirline(data: any): Promise<any> {
    return this.prisma.airline.upsert({
      where: { iataCode: data.iataCode.toUpperCase() },
      update: { name: data.name, country: data.country },
      create: {
        name: data.name,
        iataCode: data.iataCode.toUpperCase(),
        country: data.country,
      },
    });
  }

  async findFlights(tenantId?: string, filters: Record<string, any> = {}): Promise<any[]> {
    const where: any = { deletedAt: null, ...filters };
    if (tenantId) where.tenantId = tenantId;
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

  async findFlightById(id: string, tenantId?: string): Promise<any | null> {
    return this.prisma.flight.findFirst({
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
  }

  async createFlight(data: any): Promise<any> {
    return this.prisma.flight.create({ data });
  }

  async createFlightBooking(data: any): Promise<any> {
    return this.prisma.flightBooking.create({ data });
  }
}
