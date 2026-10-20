import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateKdsStationDto, UpdateKdsOrderStatusDto } from '../dto/kds.dto.js';

@Injectable()
export class KdsService {
  constructor(private readonly prisma: PrismaService) {}

  async createStation(outletId: string, dto: CreateKdsStationDto) {
    return this.prisma.kdsStation.create({
      data: {
        outletId,
        stationName: dto.stationName,
        stationType: dto.stationType,
      },
    });
  }

  async getStationsByOutlet(outletId: string) {
    return this.prisma.kdsStation.findMany({
      where: { outletId },
      include: {
        orders: {
          where: { status: { in: ['queued', 'cooking', 'ready'] } },
          include: {
            order: {
              include: {
                items: { include: { modifiers: true } },
                table: true,
              },
            },
          },
        },
      },
    });
  }

  async getActiveKitchenQueue(outletId: string) {
    const kitchenOrders = await this.prisma.posKitchenOrder.findMany({
      where: {
        order: { outletId },
        status: { in: ['queued', 'cooking', 'ready'] },
      },
      include: {
        order: {
          include: {
            items: { include: { modifiers: true } },
            table: true,
          },
        },
        station: true,
      },
      orderBy: { sentAt: 'asc' },
    });

    const now = Date.now();
    return kitchenOrders.map((ko) => {
      const waitTimeMinutes = Math.floor((now - new Date(ko.sentAt).getTime()) / (1000 * 60));
      return {
        ...ko,
        waitTimeMinutes,
        // Pulse red alert if order has been waiting > 15 minutes
        isDelayedAlert: waitTimeMinutes >= 15,
      };
    });
  }

  async updateKitchenOrderStatus(ticketId: string, dto: UpdateKdsOrderStatusDto) {
    const ticket = await this.prisma.posKitchenOrder.findUnique({
      where: { id: ticketId },
      include: { order: true },
    });
    if (!ticket) throw new NotFoundException(`Kitchen ticket ${ticketId} not found`);

    const updateData: any = { status: dto.status };
    if (dto.status === 'ready' || dto.status === 'served') {
      updateData.preparedAt = new Date();
    }

    const updated = await this.prisma.posKitchenOrder.update({
      where: { id: ticketId },
      data: updateData,
    });

    // If served and dining table exists, update table to 'dining'
    if (dto.status === 'served' && ticket.order.tableId) {
      await this.prisma.diningTable.update({
        where: { id: ticket.order.tableId },
        data: { status: 'dining' },
      });
    }

    return updated;
  }
}
