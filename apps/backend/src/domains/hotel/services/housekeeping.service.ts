import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import {
  CreateHousekeepingTaskDto,
  UpdateHousekeepingTaskStatusDto,
} from '../dto/housekeeping.dto.js';
import { RoomService } from './room.service.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class HousekeepingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roomService: RoomService,
  ) {}

  private canManageHousekeeping(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.role === 'General Manager (GM)' ||
      caller.role === 'Housekeeping Supervisor' ||
      caller.role === 'Front Desk Agent' ||
      caller.permissions.includes('housekeeping:manage') ||
      caller.permissions.includes('rooms:manage')
    );
  }

  /**
   * Lists housekeeping task queue for property or assigned housekeeper.
   */
  async listTasks(
    filter: { propertyId?: string; status?: string; housekeeperId?: string; priority?: string },
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const where: any = {
      deletedAt: null,
      room: {
        deletedAt: null,
        roomType: {
          deletedAt: null,
          property: {
            organizationId,
            ...(filter.propertyId ? { id: filter.propertyId } : {}),
          },
        },
      },
    };

    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;

    // If caller is specific housekeeper user
    if (filter.housekeeperId) {
      where.housekeeperId = filter.housekeeperId;
    }

    return this.prisma.housekeepingTask.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            floor: true,
            building: true,
            cleanlinessStatus: true,
            operationalStatus: true,
            roomType: { select: { title: true } },
          },
        },
        housekeeper: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Creates an operational cleaning task.
   */
  async createTask(
    dto: CreateHousekeepingTaskDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const room = await this.roomService.getRoomById(dto.roomId, organizationId);

    if (!this.canManageHousekeeping(caller)) {
      throw new ForbiddenException('Insufficient permissions to dispatch housekeeping tasks');
    }

    return this.prisma.housekeepingTask.create({
      data: {
        roomId: room.id,
        housekeeperId: dto.housekeeperId,
        taskType: dto.taskType,
        priority: dto.priority || 'normal',
        status: 'assigned',
      },
      include: {
        room: { select: { roomNumber: true } },
        housekeeper: { select: { name: true } },
      },
    });
  }

  /**
   * Updates task status and harmonizes room cleanliness state (Dirty -> Clean -> Inspected).
   */
  async updateTaskStatus(
    taskId: string,
    dto: UpdateHousekeepingTaskStatusDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const task = await this.prisma.housekeepingTask.findFirst({
      where: { id: taskId, deletedAt: null },
      include: {
        room: {
          include: {
            roomType: {
              include: { property: true },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Housekeeping task not found');
    }

    if (task.room.roomType.property.organizationId !== organizationId) {
      throw new ForbiddenException('Cross-tenant data access denied');
    }

    const newStatus = dto.status;
    let roomCleanlinessUpdate: string | null = null;

    if (newStatus === 'in_progress') {
      roomCleanlinessUpdate = 'cleaning';
    } else if (newStatus === 'completed') {
      roomCleanlinessUpdate = 'clean';
    } else if (newStatus === 'verified') {
      roomCleanlinessUpdate = 'inspected';
    }

    const [updatedTask] = await this.prisma.$transaction(async (tx) => {
      const t = await tx.housekeepingTask.update({
        where: { id: taskId },
        data: {
          status: newStatus,
          completionNotes: dto.completionNotes || task.completionNotes,
        },
      });

      if (roomCleanlinessUpdate) {
        await tx.room.update({
          where: { id: task.roomId },
          data: { cleanlinessStatus: roomCleanlinessUpdate },
        });

        await tx.housekeepingLog.create({
          data: {
            roomId: task.roomId,
            staffId: caller.userId,
            statusFrom: task.room.cleanlinessStatus,
            statusTo: roomCleanlinessUpdate,
            notes: `Task ${task.taskType} status changed to ${newStatus}. ${dto.completionNotes || ''}`,
          },
        });
      }

      return [t];
    });

    return {
      message: `Housekeeping task state updated to '${newStatus}'`,
      taskId: updatedTask.id,
      taskStatus: updatedTask.status,
      roomCleanlinessStatus: roomCleanlinessUpdate || task.room.cleanlinessStatus,
    };
  }
}
