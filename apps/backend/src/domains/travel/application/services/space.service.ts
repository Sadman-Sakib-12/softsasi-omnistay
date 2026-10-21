import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { BookSpaceDto, CreateSpaceDto, UpdateSpaceDto } from '../../presentation/dto/space.dto.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class SpaceService {
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
      caller.permissions.includes('spaces:manage') ||
      caller.permissions.includes('properties:manage')
    );
  }

  async listSpaces(tenantId?: string, filters?: { venueType?: string; minCapacity?: number }) {
    const where: any = { deletedAt: null };
    if (tenantId) where.tenantId = tenantId;
    if (filters?.venueType) where.venueType = filters.venueType;
    if (filters?.minCapacity) where.capacityPax = { gte: Number(filters.minCapacity) };

    return this.prisma.space.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        amenities: true,
        terms: true,
        _count: {
          select: { bookings: true },
        },
      },
    });
  }

  async getSpaceById(id: string, tenantId?: string) {
    const space = await this.prisma.space.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(tenantId ? { tenantId } : {}),
      },
      include: {
        amenities: true,
        terms: true,
        dates: { where: { isClosed: false } },
        translations: true,
      },
    });

    if (!space) {
      throw new NotFoundException(`Space with ID ${id} not found`);
    }
    return space;
  }

  async createSpace(dto: CreateSpaceDto, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to create spaces');
    }

    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const space = await this.prisma.space.create({
      data: {
        tenantId,
        title: dto.title,
        slug,
        venueType: dto.venueType,
        hourlyPrice: dto.hourlyPrice,
        dailyPrice: dto.dailyPrice ?? null,
        capacityPax: dto.capacityPax,
        squareMeters: dto.squareMeters ?? null,
        cleaningFee: dto.cleaningFee ?? 0,
        securityDeposit: dto.securityDeposit ?? 0,
        status: dto.status || 'active',
        amenities: dto.amenities?.length
          ? {
              create: dto.amenities.map((name) => ({ name })),
            }
          : undefined,
      },
      include: { amenities: true },
    });

    return space;
  }

  async updateSpace(id: string, dto: UpdateSpaceDto, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to update spaces');
    }

    await this.getSpaceById(id, tenantId);

    return this.prisma.space.update({
      where: { id },
      data: {
        title: dto.title,
        venueType: dto.venueType,
        hourlyPrice: dto.hourlyPrice,
        dailyPrice: dto.dailyPrice,
        capacityPax: dto.capacityPax,
        status: dto.status,
      },
      include: { amenities: true },
    });
  }

  async deleteSpace(id: string, tenantId: string, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to delete spaces');
    }

    await this.getSpaceById(id, tenantId);

    return this.prisma.space.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
    });
  }

  async bookSpace(dto: BookSpaceDto, userId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: dto.spaceId },
    });
    if (!space) {
      throw new NotFoundException(`Space ${dto.spaceId} not found`);
    }

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
    const calculatedTotal = Number(dto.totalAmount) || Number(space.hourlyPrice) * hours + Number(space.cleaningFee);

    return this.prisma.spaceBooking.create({
      data: {
        spaceId: dto.spaceId,
        userId,
        startTime: start,
        endTime: end,
        totalAmount: calculatedTotal,
        bookingStatus: 'confirmed',
      },
    });
  }
}
