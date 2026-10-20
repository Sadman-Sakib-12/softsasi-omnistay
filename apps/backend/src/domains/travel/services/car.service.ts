import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { BookCarDto, CreateCarDto, UpdateCarDto } from '../dto/car.dto.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class CarService {
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
      caller.permissions.includes('cars:manage') ||
      caller.permissions.includes('properties:manage')
    );
  }

  async listCars(tenantId?: string, filters?: { category?: string; transmission?: string }) {
    const where: any = { deletedAt: null };
    if (tenantId) where.tenantId = tenantId;
    if (filters?.category) where.category = filters.category;
    if (filters?.transmission) where.transmission = filters.transmission;

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

  async getCarById(id: string, tenantId?: string) {
    const car = await this.prisma.car.findFirst({
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

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
    return car;
  }

  async createCar(dto: CreateCarDto, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to create cars');
    }

    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    return this.prisma.car.create({
      data: {
        tenantId,
        title: dto.title,
        slug,
        category: dto.category,
        transmission: dto.transmission || 'Automatic',
        passengerSeats: dto.passengerSeats ?? 5,
        baggageCount: dto.baggageCount ?? 2,
        doorCount: dto.doorCount ?? 4,
        fuelType: dto.fuelType || 'Gasoline',
        dailyPrice: dto.dailyPrice,
        isUnlimitedMileage: dto.isUnlimitedMileage ?? true,
        status: dto.status || 'available',
        extraServices: dto.extraServices?.length
          ? {
              create: dto.extraServices.map((es) => ({
                name: es.name,
                price: es.price,
                priceType: es.priceType || 'per_day',
              })),
            }
          : undefined,
        pickupLocations: dto.pickupLocations?.length
          ? {
              create: dto.pickupLocations.map((pl) => ({
                stationName: pl.stationName,
                stationType: pl.stationType || 'airport',
                dropoffFee: pl.dropoffFee ?? 0,
              })),
            }
          : undefined,
      },
      include: {
        extraServices: true,
        pickupLocations: true,
      },
    });
  }

  async updateCar(id: string, dto: UpdateCarDto, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to update cars');
    }

    await this.getCarById(id, tenantId);

    return this.prisma.car.update({
      where: { id },
      data: {
        title: dto.title,
        dailyPrice: dto.dailyPrice,
        status: dto.status,
      },
      include: {
        extraServices: true,
        pickupLocations: true,
      },
    });
  }

  async deleteCar(id: string, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to delete cars');
    }

    await this.getCarById(id, tenantId);

    return this.prisma.car.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
    });
  }

  async bookCar(dto: BookCarDto, userId: string) {
    const car = await this.prisma.car.findUnique({
      where: { id: dto.carId },
    });
    if (!car) {
      throw new NotFoundException(`Car with ID ${dto.carId} not found`);
    }

    const pickup = new Date(dto.pickupDate);
    const dropoff = new Date(dto.dropoffDate);
    if (dropoff <= pickup) {
      throw new BadRequestException('Drop-off date must be after pickup date');
    }

    const days = Math.max(1, Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
    const totalAmount = days * Number(car.dailyPrice);

    return this.prisma.carBooking.create({
      data: {
        carId: dto.carId,
        userId,
        pickupDate: pickup,
        dropoffDate: dropoff,
        pickupStation: dto.pickupStation,
        dropoffStation: dto.dropoffStation,
        totalAmount,
        bookingStatus: 'confirmed',
      },
    });
  }
}
