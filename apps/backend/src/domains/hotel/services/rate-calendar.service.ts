import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import {
  CreateRatePlanDto,
  CreateSeasonalRateDto,
  SetRoomAvailabilityDto,
} from '../dto/rate-calendar.dto.js';
import { HotelService } from './hotel.service.js';
import { RoomTypeService } from './room-type.service.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class RateCalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hotelService: HotelService,
    private readonly roomTypeService: RoomTypeService,
  ) {}

  private canManageRates(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.role === 'General Manager (GM)' ||
      caller.permissions.includes('rates:manage') ||
      caller.permissions.includes('properties:manage')
    );
  }

  // --- Rate Plans ---

  async createRatePlan(
    propertyId: string,
    dto: CreateRatePlanDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    await this.hotelService.getPropertyById(propertyId, organizationId);

    if (!this.canManageRates(caller)) {
      throw new ForbiddenException('Insufficient permissions to manage rate plans');
    }

    const code = dto.code.trim().toUpperCase();

    const existing = await this.prisma.ratePlan.findUnique({
      where: {
        propertyId_code: { propertyId, code },
      },
    });

    if (existing) {
      throw new ConflictException(`Rate plan code '${code}' already exists for this property`);
    }

    if (dto.isDefault) {
      // Clear previous default
      await this.prisma.ratePlan.updateMany({
        where: { propertyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.ratePlan.create({
      data: {
        propertyId,
        name: dto.name.trim(),
        code,
        description: dto.description?.trim(),
        mealPlan: dto.mealPlan || 'EP',
        isDefault: dto.isDefault ?? false,
      },
      include: { modifiers: true },
    });
  }

  async listRatePlans(propertyId: string, organizationId?: string) {
    if (organizationId) {
      await this.hotelService.getPropertyById(propertyId, organizationId);
    }

    return this.prisma.ratePlan.findMany({
      where: { propertyId, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      include: { modifiers: true },
    });
  }

  // --- Seasonal Rates ---

  async createSeasonalRate(
    propertyId: string,
    dto: CreateSeasonalRateDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    await this.hotelService.getPropertyById(propertyId, organizationId);

    if (!this.canManageRates(caller)) {
      throw new ForbiddenException('Insufficient permissions to manage seasonal rates');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate > endDate) {
      throw new BadRequestException('Season start date cannot be after end date');
    }

    return this.prisma.seasonalRate.create({
      data: {
        propertyId,
        seasonName: dto.seasonName.trim(),
        startDate,
        endDate,
        multiplier: dto.multiplier,
      },
    });
  }

  async listSeasonalRates(propertyId: string, organizationId?: string) {
    if (organizationId) {
      await this.hotelService.getPropertyById(propertyId, organizationId);
    }

    return this.prisma.seasonalRate.findMany({
      where: { propertyId, isActive: true },
      orderBy: { startDate: 'asc' },
    });
  }

  // --- Daily Availability & Pricing Calendar ---

  async setAvailabilityBlock(
    roomTypeId: string,
    dto: SetRoomAvailabilityDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    await this.roomTypeService.getRoomTypeById(roomTypeId, organizationId);

    if (!this.canManageRates(caller)) {
      throw new ForbiddenException('Insufficient permissions to adjust room availability');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start > end) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    const recordsToUpsert = [];
    const current = new Date(start);

    while (current <= end) {
      const targetDate = new Date(current);
      recordsToUpsert.push({
        roomTypeId,
        targetDate,
        price: dto.price,
        totalInventory: dto.totalInventory,
        isClosedArrival: dto.isClosedArrival ?? false,
        isClosedDeparture: dto.isClosedDeparture ?? false,
        minStay: dto.minStay,
        maxStay: dto.maxStay,
      });
      current.setDate(current.getDate() + 1);
    }

    const results = [];
    for (const record of recordsToUpsert) {
      const upserted = await this.prisma.roomAvailability.upsert({
        where: {
          roomTypeId_targetDate: {
            roomTypeId: record.roomTypeId,
            targetDate: record.targetDate,
          },
        },
        create: record,
        update: {
          price: record.price,
          totalInventory: record.totalInventory,
          isClosedArrival: record.isClosedArrival,
          isClosedDeparture: record.isClosedDeparture,
          minStay: record.minStay,
          maxStay: record.maxStay,
        },
      });
      results.push(upserted);
    }

    return {
      message: `Successfully synchronized availability and rates across ${results.length} days`,
      daysCount: results.length,
      records: results,
    };
  }

  async getAvailabilityGrid(
    roomTypeId: string,
    startDateStr: string,
    endDateStr: string,
    organizationId?: string,
  ) {
    const roomType = await this.roomTypeService.getRoomTypeById(roomTypeId, organizationId);

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      throw new BadRequestException('Invalid date range parameter (expected YYYY-MM-DD)');
    }

    // Query explicit overrides
    const explicitRecords = await this.prisma.roomAvailability.findMany({
      where: {
        roomTypeId,
        targetDate: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { targetDate: 'asc' },
    });

    const explicitMap = new Map<string, any>();
    for (const rec of explicitRecords) {
      const key = rec.targetDate.toISOString().split('T')[0];
      explicitMap.set(key, rec);
    }

    // Query seasonal multipliers for the property
    const seasonalRates = await this.prisma.seasonalRate.findMany({
      where: {
        propertyId: roomType.propertyId,
        isActive: true,
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    });

    // Count physical operational rooms
    const activeRoomsCount = await this.prisma.room.count({
      where: {
        roomTypeId,
        deletedAt: null,
        operationalStatus: 'available',
      },
    });

    const basePriceNum = Number(roomType.basePrice);
    const grid = [];
    const current = new Date(start);

    while (current <= end) {
      const dateKey = current.toISOString().split('T')[0];
      const targetDate = new Date(current);

      if (explicitMap.has(dateKey)) {
        const item = explicitMap.get(dateKey);
        grid.push({
          date: dateKey,
          price: Number(item.price),
          totalInventory: item.totalInventory,
          bookedCount: item.bookedCount,
          availableInventory: Math.max(0, item.totalInventory - item.bookedCount),
          isClosedArrival: item.isClosedArrival,
          isClosedDeparture: item.isClosedDeparture,
          minStay: item.minStay,
          maxStay: item.maxStay,
          isExplicitOverride: true,
        });
      } else {
        // Calculate based on seasonal multiplier
        let multiplier = 1.0;
        for (const season of seasonalRates) {
          if (targetDate >= season.startDate && targetDate <= season.endDate) {
            multiplier = Number(season.multiplier);
            break;
          }
        }

        const calculatedPrice = Math.round(basePriceNum * multiplier * 100) / 100;

        grid.push({
          date: dateKey,
          price: calculatedPrice,
          totalInventory: activeRoomsCount,
          bookedCount: 0,
          availableInventory: activeRoomsCount,
          isClosedArrival: false,
          isClosedDeparture: false,
          minStay: null,
          maxStay: null,
          isExplicitOverride: false,
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return {
      roomTypeId,
      roomTypeTitle: roomType.title,
      basePrice: basePriceNum,
      dateRange: { startDate: startDateStr, endDate: endDateStr },
      grid,
    };
  }
}
