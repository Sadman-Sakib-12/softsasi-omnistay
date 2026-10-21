import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto } from '../../presentation/dto/create-room.dto.js';
import { RoomTypeService } from './room-type.service.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class RoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roomTypeService: RoomTypeService,
  ) {}

  private canManageRooms(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.role === 'General Manager (GM)' ||
      caller.role === 'Front Desk Agent' ||
      caller.permissions.includes('rooms:manage') ||
      caller.permissions.includes('properties:manage')
    );
  }

  private canUpdateStatus(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      this.canManageRooms(caller) ||
      caller.role === 'Housekeeping Supervisor' ||
      caller.role === 'Maintenance Engineer' ||
      caller.permissions.includes('housekeeping:update') ||
      caller.permissions.includes('housekeeping:manage') ||
      caller.permissions.includes('rooms:out_of_order')
    );
  }

  /**
   * Creates a physical room unit under a room category.
   */
  async createRoom(
    roomTypeId: string,
    dto: CreateRoomDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const roomType = await this.roomTypeService.getRoomTypeById(roomTypeId, organizationId);

    if (!this.canManageRooms(caller)) {
      throw new ForbiddenException('Insufficient permissions to create physical rooms');
    }

    const roomNumber = dto.roomNumber.trim().toUpperCase();

    const existingRoom = await this.prisma.room.findFirst({
      where: {
        roomTypeId,
        roomNumber,
        deletedAt: null,
      },
    });

    if (existingRoom) {
      throw new ConflictException(`Room number '${roomNumber}' already exists in this category`);
    }

    return this.prisma.room.create({
      data: {
        roomTypeId,
        roomNumber,
        floor: dto.floor,
        building: dto.building?.trim(),
        cleanlinessStatus: dto.cleanlinessStatus || 'clean',
        operationalStatus: dto.operationalStatus || 'available',
        keycardCode: dto.keycardCode?.trim(),
        createdBy: caller.userId,
      },
      include: {
        roomType: {
          select: { id: true, title: true, basePrice: true },
        },
      },
    });
  }

  /**
   * Lists physical room units, optionally filtered by property, roomType, or status.
   */
  async listRooms(
    filter: {
      propertyId?: string;
      roomTypeId?: string;
      cleanlinessStatus?: string;
      operationalStatus?: string;
    },
    organizationId?: string,
  ) {
    const where: any = {
      deletedAt: null,
    };

    if (filter.roomTypeId) {
      where.roomTypeId = filter.roomTypeId;
    }

    if (filter.cleanlinessStatus) {
      where.cleanlinessStatus = filter.cleanlinessStatus;
    }

    if (filter.operationalStatus) {
      where.operationalStatus = filter.operationalStatus;
    }

    if (filter.propertyId || organizationId) {
      where.roomType = {
        deletedAt: null,
        property: {
          deletedAt: null,
          ...(filter.propertyId ? { id: filter.propertyId } : {}),
          ...(organizationId ? { organizationId } : {}),
        },
      };
    }

    return this.prisma.room.findMany({
      where,
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
      include: {
        roomType: {
          select: {
            id: true,
            title: true,
            basePrice: true,
            property: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });
  }

  /**
   * Retrieves single room details by UUID.
   */
  async getRoomById(id: string, organizationId?: string) {
    const room = await this.prisma.room.findFirst({
      where: { id, deletedAt: null },
      include: {
        roomType: {
          include: {
            property: {
              select: { id: true, organizationId: true, name: true, code: true },
            },
            roomBeds: true,
          },
        },
        housekeepingTasks: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        workOrders: {
          where: { status: { notIn: ['closed', 'resolved'] } },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Physical room unit not found');
    }

    if (organizationId && room.roomType.property.organizationId !== organizationId) {
      throw new ForbiddenException('Cross-tenant data access denied: Room belongs to another organization');
    }

    return room;
  }

  /**
   * Updates physical room specifications.
   */
  async updateRoom(
    id: string,
    dto: UpdateRoomDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const existing = await this.getRoomById(id, organizationId);

    if (!this.canManageRooms(caller)) {
      throw new ForbiddenException('Insufficient permissions to modify physical rooms');
    }

    let targetRoomTypeId = existing.roomTypeId;
    if (dto.roomTypeId && dto.roomTypeId !== existing.roomTypeId) {
      await this.roomTypeService.getRoomTypeById(dto.roomTypeId, organizationId);
      targetRoomTypeId = dto.roomTypeId;
    }

    const roomNumber = dto.roomNumber ? dto.roomNumber.trim().toUpperCase() : existing.roomNumber;

    if (dto.roomNumber && dto.roomNumber !== existing.roomNumber) {
      const conflict = await this.prisma.room.findFirst({
        where: {
          roomTypeId: targetRoomTypeId,
          roomNumber,
          deletedAt: null,
          id: { not: id },
        },
      });
      if (conflict) {
        throw new ConflictException(`Room number '${roomNumber}' already exists in this category`);
      }
    }

    return this.prisma.room.update({
      where: { id },
      data: {
        roomTypeId: targetRoomTypeId,
        roomNumber,
        floor: dto.floor,
        building: dto.building?.trim(),
        keycardCode: dto.keycardCode?.trim(),
        updatedBy: caller.userId,
      },
      include: {
        roomType: { select: { id: true, title: true } },
      },
    });
  }

  /**
   * Updates room cleanliness or operational status with automated audit trail logging.
   */
  async updateRoomStatus(
    id: string,
    dto: UpdateRoomStatusDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const existing = await this.getRoomById(id, organizationId);

    if (!this.canUpdateStatus(caller)) {
      throw new ForbiddenException('Insufficient permissions to update room operational/cleanliness status');
    }

    const statusFrom = `${existing.cleanlinessStatus}/${existing.operationalStatus}`;
    const newCleanliness = dto.cleanlinessStatus || existing.cleanlinessStatus;
    const newOperational = dto.operationalStatus || existing.operationalStatus;
    const statusTo = `${newCleanliness}/${newOperational}`;

    const [updatedRoom] = await this.prisma.$transaction([
      this.prisma.room.update({
        where: { id },
        data: {
          cleanlinessStatus: newCleanliness,
          operationalStatus: newOperational,
          updatedBy: caller.userId,
        },
      }),
      this.prisma.housekeepingLog.create({
        data: {
          roomId: id,
          staffId: caller.userId,
          statusFrom,
          statusTo,
          notes: dto.notes || `Status transition: ${statusFrom} -> ${statusTo}`,
        },
      }),
    ]);

    return updatedRoom;
  }

  /**
   * Soft deletes a room.
   */
  async deleteRoom(id: string, organizationId: string, caller: AuthenticatedUserPayload) {
    await this.getRoomById(id, organizationId);

    if (!this.canManageRooms(caller)) {
      throw new ForbiddenException('Insufficient permissions to delete room');
    }

    return this.prisma.room.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        operationalStatus: 'oos',
        updatedBy: caller.userId,
      },
    });
  }
}
