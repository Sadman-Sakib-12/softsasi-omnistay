import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { BookBoatDto, CreateBoatDto, UpdateBoatDto } from '../dto/boat.dto.js';
import type { AuthenticatedUserPayload } from '../../../common/decorators/current-user.decorator.js';

@Injectable()
export class BoatService {
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
      caller.permissions.includes('boats:manage') ||
      caller.permissions.includes('properties:manage')
    );
  }

  async listBoats(tenantId?: string, filters?: { vesselType?: string; charterType?: string }) {
    const where: any = { deletedAt: null };
    if (tenantId) where.tenantId = tenantId;
    if (filters?.vesselType) where.vesselType = filters.vesselType;
    if (filters?.charterType) where.charterType = filters.charterType;

    return this.prisma.boat.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        crewing: true,
        staterooms: true,
        specs: true,
        _count: { select: { bookings: true } },
      },
    });
  }

  async getBoatById(id: string, tenantId?: string) {
    const boat = await this.prisma.boat.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(tenantId ? { tenantId } : {}),
      },
      include: {
        crewing: true,
        staterooms: true,
        specs: true,
        dates: { where: { isClosed: false } },
        translations: true,
      },
    });

    if (!boat) {
      throw new NotFoundException(`Boat with ID ${id} not found`);
    }
    return boat;
  }

  async createBoat(dto: CreateBoatDto, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to create boats');
    }

    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    return this.prisma.boat.create({
      data: {
        tenantId,
        title: dto.title,
        slug,
        vesselType: dto.vesselType,
        lengthMeters: dto.lengthMeters ?? null,
        guestCapacity: dto.guestCapacity,
        berthsCount: dto.berthsCount ?? 2,
        dailyPrice: dto.dailyPrice,
        charterType: dto.charterType || 'skippered',
        status: dto.status || 'available',
        staterooms: dto.staterooms?.length
          ? {
              create: dto.staterooms.map((sr) => ({
                name: sr.name,
                bedType: sr.bedType || 'King',
                hasEnSuite: sr.hasEnSuite ?? true,
              })),
            }
          : undefined,
        crewing: dto.crewing?.length
          ? {
              create: dto.crewing.map((cr) => ({
                role: cr.role,
                crewCount: cr.crewCount ?? 1,
                isIncluded: cr.isIncluded ?? true,
              })),
            }
          : undefined,
      },
      include: {
        staterooms: true,
        crewing: true,
      },
    });
  }

  async updateBoat(id: string, dto: UpdateBoatDto, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to update boats');
    }

    await this.getBoatById(id, tenantId);

    return this.prisma.boat.update({
      where: { id },
      data: {
        title: dto.title,
        dailyPrice: dto.dailyPrice,
        status: dto.status,
      },
      include: {
        staterooms: true,
        crewing: true,
      },
    });
  }

  async deleteBoat(id: string, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to delete boats');
    }

    await this.getBoatById(id, tenantId);

    return this.prisma.boat.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
    });
  }

  async bookBoat(dto: BookBoatDto, userId: string) {
    const boat = await this.prisma.boat.findUnique({
      where: { id: dto.boatId },
    });
    if (!boat) {
      throw new NotFoundException(`Boat with ID ${dto.boatId} not found`);
    }

    const start = new Date(dto.charterStart);
    const end = new Date(dto.charterEnd);
    if (end <= start) {
      throw new BadRequestException('Charter end must be after charter start');
    }

    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const totalAmount = days * Number(boat.dailyPrice);

    return this.prisma.boatBooking.create({
      data: {
        boatId: dto.boatId,
        userId,
        charterStart: start,
        charterEnd: end,
        totalAmount,
        bookingStatus: 'confirmed',
      },
    });
  }
}
