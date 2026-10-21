import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from '../../presentation/dto/create-room-type.dto.js';
import { CreateRoomBedDto } from '../../presentation/dto/create-room-bed.dto.js';
import { HotelService } from './hotel.service.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class RoomTypeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hotelService: HotelService,
  ) {}

  private canManageInventory(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.role === 'General Manager (GM)' ||
      caller.permissions.includes('rooms:manage') ||
      caller.permissions.includes('properties:manage')
    );
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Creates a room category (RoomType) under a specific property.
   */
  async createRoomType(
    propertyId: string,
    dto: CreateRoomTypeDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    await this.hotelService.getPropertyById(propertyId, organizationId);

    if (!this.canManageInventory(caller)) {
      throw new ForbiddenException('Insufficient permissions to manage room categories');
    }

    const slug = dto.slug?.trim().toLowerCase() || this.generateSlug(dto.title);

    const existingSlug = await this.prisma.roomType.findFirst({
      where: {
        propertyId,
        slug,
        deletedAt: null,
      },
    });

    if (existingSlug) {
      throw new ConflictException(`Room type with slug '${slug}' already exists for this property`);
    }

    return this.prisma.roomType.create({
      data: {
        propertyId,
        title: dto.title.trim(),
        slug,
        basePrice: dto.basePrice,
        maxAdults: dto.maxAdults ?? 2,
        maxChildren: dto.maxChildren ?? 0,
        squareMeters: dto.squareMeters,
        status: dto.status ?? 'active',
        createdBy: caller.userId,
      },
      include: {
        roomBeds: true,
      },
    });
  }

  /**
   * Lists active room types belonging to a property.
   */
  async listRoomTypes(propertyId: string, organizationId?: string) {
    if (organizationId) {
      await this.hotelService.getPropertyById(propertyId, organizationId);
    }

    return this.prisma.roomType.findMany({
      where: {
        propertyId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        roomBeds: true,
        _count: {
          select: {
            rooms: { where: { deletedAt: null } },
          },
        },
      },
    });
  }

  /**
   * Retrieves single room category details.
   */
  async getRoomTypeById(id: string, organizationId?: string) {
    const roomType = await this.prisma.roomType.findFirst({
      where: { id, deletedAt: null },
      include: {
        property: {
          select: { id: true, organizationId: true, name: true, currency: true },
        },
        roomBeds: true,
        rooms: {
          where: { deletedAt: null },
          select: {
            id: true,
            roomNumber: true,
            floor: true,
            building: true,
            cleanlinessStatus: true,
            operationalStatus: true,
          },
        },
        _count: {
          select: {
            rooms: { where: { deletedAt: null } },
            icalFeeds: true,
          },
        },
      },
    });

    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    if (organizationId && roomType.property.organizationId !== organizationId) {
      throw new ForbiddenException('Cross-tenant data access denied: Room category belongs to another organization');
    }

    return roomType;
  }

  /**
   * Updates room category details.
   */
  async updateRoomType(
    id: string,
    dto: UpdateRoomTypeDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const existing = await this.getRoomTypeById(id, organizationId);

    if (!this.canManageInventory(caller)) {
      throw new ForbiddenException('Insufficient permissions to modify room categories');
    }

    let slug = existing.slug;
    if (dto.slug && dto.slug !== existing.slug) {
      slug = dto.slug.trim().toLowerCase();
      const conflict = await this.prisma.roomType.findFirst({
        where: {
          propertyId: existing.propertyId,
          slug,
          deletedAt: null,
          id: { not: id },
        },
      });
      if (conflict) {
        throw new ConflictException(`Room type slug '${slug}' is already taken`);
      }
    }

    return this.prisma.roomType.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        slug,
        basePrice: dto.basePrice,
        maxAdults: dto.maxAdults,
        maxChildren: dto.maxChildren,
        squareMeters: dto.squareMeters,
        status: dto.status,
        updatedBy: caller.userId,
      },
      include: {
        roomBeds: true,
      },
    });
  }

  /**
   * Soft deletes a room category.
   */
  async deleteRoomType(id: string, organizationId: string, caller: AuthenticatedUserPayload) {
    await this.getRoomTypeById(id, organizationId);

    if (!this.canManageInventory(caller)) {
      throw new ForbiddenException('Insufficient permissions to delete room categories');
    }

    return this.prisma.roomType.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'archived',
        updatedBy: caller.userId,
      },
    });
  }

  // --- Bed Configurations ---

  /**
   * Adds bed configuration to room category.
   */
  async addBed(
    roomTypeId: string,
    dto: CreateRoomBedDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    await this.getRoomTypeById(roomTypeId, organizationId);

    if (!this.canManageInventory(caller)) {
      throw new ForbiddenException('Insufficient permissions to configure beds');
    }

    return this.prisma.roomBed.create({
      data: {
        roomTypeId,
        bedType: dto.bedType,
        quantity: dto.quantity,
      },
    });
  }

  /**
   * Lists beds configured for room type.
   */
  async listBeds(roomTypeId: string, organizationId?: string) {
    await this.getRoomTypeById(roomTypeId, organizationId);

    return this.prisma.roomBed.findMany({
      where: { roomTypeId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Removes bed configuration from room category.
   */
  async removeBed(
    roomTypeId: string,
    bedId: string,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    await this.getRoomTypeById(roomTypeId, organizationId);

    if (!this.canManageInventory(caller)) {
      throw new ForbiddenException('Insufficient permissions to remove bed configuration');
    }

    const bed = await this.prisma.roomBed.findFirst({
      where: { id: bedId, roomTypeId },
    });

    if (!bed) {
      throw new NotFoundException('Bed configuration record not found');
    }

    return this.prisma.roomBed.delete({
      where: { id: bedId },
    });
  }
}
