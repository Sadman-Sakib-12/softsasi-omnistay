import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IHotelRepository } from '../../domain/repositories/hotel.repository.interface.js';

@Injectable()
export class PrismaHotelRepository implements IHotelRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Properties / Hotels
  async findHotels(organizationId: string): Promise<any[]> {
    return this.prisma.hotel.findMany({
      where: { organizationId, deletedAt: null },
      include: { roomTypes: true, rooms: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findHotelById(id: string): Promise<any | null> {
    return this.prisma.hotel.findUnique({
      where: { id },
      include: { roomTypes: true, rooms: true },
    });
  }

  async findHotelByCode(organizationId: string, code: string): Promise<any | null> {
    return this.prisma.hotel.findFirst({
      where: { organizationId, code, deletedAt: null },
    });
  }

  async createHotel(data: any): Promise<any> {
    return this.prisma.hotel.create({ data });
  }

  async updateHotel(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.hotel.update({ where: { id }, data });
  }

  // Room Types
  async findRoomTypes(propertyId: string): Promise<any[]> {
    return this.prisma.roomType.findMany({
      where: { propertyId },
      include: { rooms: true },
    });
  }

  async findRoomTypeById(id: string): Promise<any | null> {
    return this.prisma.roomType.findUnique({
      where: { id },
      include: { property: true, rooms: true },
    });
  }

  async createRoomType(data: any): Promise<any> {
    return this.prisma.roomType.create({ data });
  }

  async updateRoomType(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.roomType.update({ where: { id }, data });
  }

  // Rooms
  async findRooms(propertyId: string, roomTypeId?: string): Promise<any[]> {
    const where: any = { roomType: { propertyId } };
    if (roomTypeId) where.roomTypeId = roomTypeId;
    return this.prisma.room.findMany({
      where,
      include: { roomType: true },
      orderBy: { roomNumber: 'asc' },
    });
  }

  async findRoomById(id: string): Promise<any | null> {
    return this.prisma.room.findUnique({
      where: { id },
      include: { roomType: true },
    });
  }

  async createRoom(data: any): Promise<any> {
    return this.prisma.room.create({ data });
  }

  async updateRoom(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.room.update({ where: { id }, data });
  }

  // Rates & Calendar
  async findRatePlans(propertyId: string): Promise<any[]> {
    return this.prisma.ratePlan.findMany({
      where: { propertyId },
    });
  }

  async createRatePlan(data: any): Promise<any> {
    return this.prisma.ratePlan.create({ data });
  }

  async findDailyRates(propertyId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return this.prisma.seasonalRate.findMany({
      where: {
        propertyId,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });
  }

  async upsertDailyRate(data: any): Promise<any> {
    return this.prisma.seasonalRate.create({ data });
  }

  // Bookings
  async createBooking(data: any): Promise<any> {
    return this.prisma.booking.create({
      data,
      include: { folios: true },
    });
  }

  async findBookingById(id: string): Promise<any | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        bookingItems: { include: { roomType: true } },
        folios: { include: { transactions: true } },
      },
    });
  }

  async findBookingByCode(bookingCode: string): Promise<any | null> {
    return this.prisma.booking.findUnique({
      where: { bookingCode },
      include: {
        bookingItems: { include: { roomType: true } },
        folios: { include: { transactions: true } },
      },
    });
  }

  async findBookings(propertyId: string, options: Record<string, any> = {}): Promise<any[]> {
    const where: any = { propertyId, ...options };
    return this.prisma.booking.findMany({
      where,
      include: { bookingItems: { include: { roomType: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateBooking(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.booking.update({ where: { id }, data });
  }

  // Folios
  async findFolioById(id: string): Promise<any | null> {
    return this.prisma.guestFolio.findUnique({
      where: { id },
      include: { transactions: true, booking: true },
    });
  }

  async findFoliosByBooking(bookingId: string): Promise<any[]> {
    return this.prisma.guestFolio.findMany({
      where: { bookingId },
      include: { transactions: true },
    });
  }

  async createFolio(data: any): Promise<any> {
    return this.prisma.guestFolio.create({ data });
  }

  async createFolioTransaction(data: any): Promise<any> {
    return this.prisma.folioTransaction.create({ data });
  }

  async updateFolio(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.guestFolio.update({ where: { id }, data });
  }

  // Housekeeping
  async findHousekeepingTasks(propertyId: string, status?: string): Promise<any[]> {
    const where: any = { room: { roomType: { propertyId } } };
    if (status) where.status = status;
    return this.prisma.housekeepingTask.findMany({
      where,
      include: { room: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createHousekeepingTask(data: any): Promise<any> {
    return this.prisma.housekeepingTask.create({ data });
  }

  async updateHousekeepingTask(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.housekeepingTask.update({ where: { id }, data });
  }

  // Maintenance
  async findMaintenanceTickets(propertyId: string): Promise<any[]> {
    return this.prisma.maintenanceWorkOrder.findMany({
      where: { propertyId },
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMaintenanceTicket(data: any): Promise<any> {
    return this.prisma.maintenanceWorkOrder.create({ data });
  }

  async updateMaintenanceTicket(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.maintenanceWorkOrder.update({ where: { id }, data });
  }

  // iCal
  async findIcalFeeds(propertyId: string): Promise<any[]> {
    return this.prisma.icalFeed.findMany({
      where: { roomType: { propertyId } },
      include: { roomType: true },
    });
  }

  async createIcalFeed(data: any): Promise<any> {
    return this.prisma.icalFeed.create({ data });
  }

  async updateIcalFeed(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.icalFeed.update({ where: { id }, data });
  }
}
