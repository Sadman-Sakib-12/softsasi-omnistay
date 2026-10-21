import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import {
  CreateMaintenanceWorkOrderDto,
  UpdateMaintenanceWorkOrderStatusDto,
} from '../../presentation/dto/maintenance.dto.js';
import { HotelService } from './hotel.service.js';
import { RoomService } from './room.service.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hotelService: HotelService,
    private readonly roomService: RoomService,
  ) {}

  private canManageMaintenance(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.role === 'General Manager (GM)' ||
      caller.role === 'Maintenance Engineer' ||
      caller.role === 'Front Desk Agent' ||
      caller.permissions.includes('maintenance:tickets') ||
      caller.permissions.includes('rooms:out_of_order')
    );
  }

  /**
   * Dispatches a new facilities/engineering work order, with optional automated room Out-of-Order blocking.
   */
  async createWorkOrder(
    dto: CreateMaintenanceWorkOrderDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    await this.hotelService.getPropertyById(dto.propertyId, organizationId);

    if (!this.canManageMaintenance(caller)) {
      throw new ForbiddenException('Insufficient permissions to dispatch maintenance work orders');
    }

    if (dto.roomId) {
      await this.roomService.getRoomById(dto.roomId, organizationId);
    }

    const isEmergency = dto.priority === 'emergency';
    const shouldBlock = dto.blockRoomOutOfOrder || isEmergency;

    const workOrder = await this.prisma.$transaction(async (tx) => {
      const wo = await tx.maintenanceWorkOrder.create({
        data: {
          propertyId: dto.propertyId,
          roomId: dto.roomId,
          title: dto.title.trim(),
          description: dto.description.trim(),
          priority: dto.priority || 'routine',
          slaHours: dto.slaHours ?? (isEmergency ? 2 : 24),
          status: 'open',
          assignedTo: dto.assignedTo,
        },
      });

      // Block room from availability if requested
      if (dto.roomId && shouldBlock) {
        await tx.room.update({
          where: { id: dto.roomId },
          data: { operationalStatus: 'ooo' },
        });

        await tx.housekeepingLog.create({
          data: {
            roomId: dto.roomId,
            staffId: caller.userId,
            statusFrom: 'available',
            statusTo: 'ooo',
            notes: `Blocked Out-of-Order due to Maintenance Ticket #${wo.id}: ${dto.title}`,
          },
        });
      }

      return wo;
    });

    return {
      message: 'Maintenance work order dispatched successfully',
      workOrderId: workOrder.id,
      title: workOrder.title,
      priority: workOrder.priority,
      slaHours: workOrder.slaHours,
      roomBlockedOutOfOrder: shouldBlock,
    };
  }

  /**
   * Lists maintenance work orders for a property.
   */
  async listWorkOrders(
    filter: { propertyId?: string; status?: string; priority?: string; roomId?: string },
    organizationId: string,
  ) {
    if (filter.propertyId) {
      await this.hotelService.getPropertyById(filter.propertyId, organizationId);
    }

    const where: any = {};

    if (filter.propertyId) where.propertyId = filter.propertyId;
    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;
    if (filter.roomId) where.roomId = filter.roomId;

    return this.prisma.maintenanceWorkOrder.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        room: {
          select: { id: true, roomNumber: true, operationalStatus: true },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Updates maintenance work order status and optionally restores room to available.
   */
  async updateWorkOrderStatus(
    id: string,
    dto: UpdateMaintenanceWorkOrderStatusDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    if (!this.canManageMaintenance(caller)) {
      throw new ForbiddenException('Insufficient permissions to update maintenance tickets');
    }

    const wo = await this.prisma.maintenanceWorkOrder.findUnique({
      where: { id },
    });

    if (!wo) {
      throw new NotFoundException('Maintenance work order not found');
    }

    if (organizationId) {
      await this.hotelService.getPropertyById(wo.propertyId, organizationId);
    }

    const isResolvedOrClosed = dto.status === 'resolved' || dto.status === 'closed';

    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.maintenanceWorkOrder.update({
        where: { id },
        data: {
          status: dto.status,
        },
      });

      if (dto.notes) {
        await tx.maintenanceLog.create({
          data: {
            workOrderId: id,
            technicianId: caller.userId,
            notes: dto.notes,
          },
        });
      }

      // Restore room if resolved
      if (wo.roomId && isResolvedOrClosed && dto.restoreRoomAvailable) {
        await tx.room.update({
          where: { id: wo.roomId },
          data: { operationalStatus: 'available' },
        });

        await tx.housekeepingLog.create({
          data: {
            roomId: wo.roomId,
            staffId: caller.userId,
            statusFrom: 'ooo',
            statusTo: 'available',
            notes: `Restored to available following ticket resolution: ${dto.notes || 'Repairs completed'}`,
          },
        });
      }

      return order;
    });

    return {
      message: `Work order state updated to '${dto.status}'`,
      workOrderId: updated.id,
      status: updated.status,
      roomRestoredAvailable: isResolvedOrClosed && dto.restoreRoomAvailable,
    };
  }
}
