import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateHotelDto } from '../dto/create-hotel.dto.js';
import { UpdateHotelDto } from '../dto/update-hotel.dto.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class HotelService {
  constructor(private readonly prisma: PrismaService) {}

  private canManageProperties(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.role === 'General Manager (GM)' ||
      caller.permissions.includes('properties:manage')
    );
  }

  /**
   * Lists properties/hotels belonging to the authenticated tenant organization.
   */
  async listProperties(organizationId?: string, caller?: AuthenticatedUserPayload) {
    const targetOrgId = organizationId || caller?.organizationId;
    if (!targetOrgId) {
      return [];
    }

    return this.prisma.hotel.findMany({
      where: {
        organizationId: targetOrgId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        organizationId: true,
        name: true,
        code: true,
        timezone: true,
        currency: true,
        propertyType: true,
        starRating: true,
        address: true,
        lat: true,
        lng: true,
        checkInTime: true,
        checkOutTime: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            roomTypes: { where: { deletedAt: null } },
            bookings: { where: { deletedAt: null } },
          },
        },
      },
    });
  }

  /**
   * Retrieves a single property by ID within the tenant.
   */
  async getPropertyById(id: string, organizationId?: string) {
    const hotel = await this.prisma.hotel.findFirst({
      where: { id, deletedAt: null },
      include: {
        organization: {
          select: { id: true, name: true, slug: true },
        },
        roomTypes: {
          where: { deletedAt: null },
          include: {
            roomBeds: true,
            _count: {
              select: { rooms: { where: { deletedAt: null } } },
            },
          },
        },
        ratePlans: {
          where: { isActive: true },
        },
        seasonalRates: {
          where: { isActive: true },
        },
      },
    });

    if (!hotel) {
      throw new NotFoundException('Property not found');
    }

    if (organizationId && hotel.organizationId !== organizationId) {
      throw new ForbiddenException(
        'Cross-tenant data access denied: Property belongs to another organization',
      );
    }

    return hotel;
  }

  /**
   * Creates a new hotel property profile linked to the organization.
   */
  async createProperty(
    dto: CreateHotelDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    if (!organizationId) {
      throw new ForbiddenException('Organization context is required to create a property');
    }

    if (!this.canManageProperties(caller)) {
      throw new ForbiddenException('Insufficient permissions to create property profiles');
    }

    const existingCode = await this.prisma.hotel.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: dto.code.trim().toUpperCase(),
        },
      },
    });

    if (existingCode) {
      throw new ConflictException(`Property code '${dto.code}' already exists in this organization`);
    }

    return this.prisma.hotel.create({
      data: {
        organizationId,
        name: dto.name.trim(),
        code: dto.code.trim().toUpperCase(),
        timezone: dto.timezone || 'Asia/Dhaka',
        currency: dto.currency || 'BDT',
      },
    });
  }

  /**
   * Updates an existing hotel property profile.
   */
  async updateProperty(
    id: string,
    dto: UpdateHotelDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    await this.getPropertyById(id, organizationId);

    if (!this.canManageProperties(caller)) {
      throw new ForbiddenException('Insufficient permissions to modify property profiles');
    }

    return this.prisma.hotel.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        timezone: dto.timezone,
        currency: dto.currency,
        propertyType: dto.propertyType,
        starRating: dto.starRating,
        address: dto.address?.trim(),
        lat: dto.lat,
        lng: dto.lng,
        checkInTime: dto.checkInTime,
        checkOutTime: dto.checkOutTime,
        status: dto.status,
      },
    });
  }

  /**
   * Soft deletes a hotel property.
   */
  async deleteProperty(id: string, organizationId: string, caller: AuthenticatedUserPayload) {
    await this.getPropertyById(id, organizationId);

    if (!this.canManageProperties(caller)) {
      throw new ForbiddenException('Insufficient permissions to delete property profiles');
    }

    return this.prisma.hotel.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'archived',
      },
    });
  }
}

export const HotelsService = HotelService;
