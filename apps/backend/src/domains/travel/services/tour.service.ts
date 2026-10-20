import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { BookTourDto, CreateTourDto, UpdateTourDto } from '../dto/tour.dto.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class TourService {
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
      caller.permissions.includes('tours:manage') ||
      caller.permissions.includes('properties:manage')
    );
  }

  async listTours(tenantId?: string, filters?: { minPax?: number; maxPrice?: number }) {
    const where: any = { deletedAt: null };
    if (tenantId) where.tenantId = tenantId;
    if (filters?.minPax) where.maxPax = { gte: Number(filters.minPax) };
    if (filters?.maxPrice) where.basePriceAdult = { lte: Number(filters.maxPrice) };

    return this.prisma.tour.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        itineraries: { orderBy: { dayNumber: 'asc' } },
        personTypes: true,
        inclusions: true,
        guides: true,
        _count: {
          select: { bookings: true },
        },
      },
    });
  }

  async getTourById(id: string, tenantId?: string) {
    const tour = await this.prisma.tour.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(tenantId ? { tenantId } : {}),
      },
      include: {
        itineraries: { orderBy: { dayNumber: 'asc' } },
        personTypes: true,
        inclusions: true,
        guides: true,
        dates: { where: { isClosed: false } },
        translations: true,
      },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }
    return tour;
  }

  async createTour(dto: CreateTourDto, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to create tours');
    }

    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    return this.prisma.tour.create({
      data: {
        tenantId,
        title: dto.title,
        slug,
        durationDays: dto.durationDays,
        durationHours: dto.durationHours ?? null,
        minPax: dto.minPax ?? 1,
        maxPax: dto.maxPax ?? 20,
        basePriceAdult: dto.basePriceAdult,
        status: dto.status || 'active',
        itineraries: dto.itineraries?.length
          ? {
              create: dto.itineraries.map((it) => ({
                dayNumber: it.dayNumber,
                title: it.title,
                description: it.description,
                lat: it.lat ?? null,
                lng: it.lng ?? null,
              })),
            }
          : undefined,
        personTypes: dto.personTypes?.length
          ? {
              create: dto.personTypes.map((pt) => ({
                name: pt.name,
                price: pt.price,
                minAge: pt.minAge ?? null,
                maxAge: pt.maxAge ?? null,
              })),
            }
          : undefined,
        inclusions: dto.inclusions?.length
          ? {
              create: dto.inclusions.map((content) => ({
                content,
                isInclusion: true,
              })),
            }
          : undefined,
      },
      include: {
        itineraries: true,
        personTypes: true,
        inclusions: true,
      },
    });
  }

  async updateTour(id: string, dto: UpdateTourDto, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to update tours');
    }

    await this.getTourById(id, tenantId);

    return this.prisma.tour.update({
      where: { id },
      data: {
        title: dto.title,
        basePriceAdult: dto.basePriceAdult,
        status: dto.status,
      },
      include: {
        itineraries: true,
        personTypes: true,
        inclusions: true,
      },
    });
  }

  async deleteTour(id: string, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to delete tours');
    }

    await this.getTourById(id, tenantId);

    return this.prisma.tour.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
    });
  }

  async bookTour(dto: BookTourDto, userId: string) {
    const tour = await this.prisma.tour.findUnique({
      where: { id: dto.tourId },
      include: { personTypes: true },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${dto.tourId} not found`);
    }

    const totalPax = dto.paxAdults + (dto.paxChildren || 0);
    if (totalPax > tour.maxPax) {
      throw new BadRequestException(`Maximum allowed passengers is ${tour.maxPax}`);
    }

    // Calculate total price based on adult price and child tier if present
    const childTier = tour.personTypes.find((p) => p.name.toLowerCase() === 'child');
    const childPrice = childTier ? Number(childTier.price) : Number(tour.basePriceAdult) * 0.6;
    const totalAmount = dto.paxAdults * Number(tour.basePriceAdult) + (dto.paxChildren || 0) * childPrice;

    return this.prisma.tourBooking.create({
      data: {
        tourId: dto.tourId,
        userId,
        bookingDate: new Date(dto.bookingDate),
        paxAdults: dto.paxAdults,
        paxChildren: dto.paxChildren || 0,
        totalAmount,
        bookingStatus: 'confirmed',
      },
    });
  }
}
