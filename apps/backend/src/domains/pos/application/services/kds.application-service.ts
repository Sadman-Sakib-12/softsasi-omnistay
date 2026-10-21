import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  POS_REPOSITORY_TOKEN,
  type IPosRepository,
} from '../../domain/repositories/pos.repository.interface.js';
import type {
  CreateKdsStationDto,
  UpdateKdsOrderStatusDto,
} from '../../presentation/dto/kds.dto.js';

@Injectable()
export class KdsApplicationService {
  constructor(
    @Inject(POS_REPOSITORY_TOKEN)
    private readonly repo: IPosRepository,
  ) {}

  async createStation(outletId: string, dto: CreateKdsStationDto) {
    return this.repo.createKdsStation({
      outletId,
      stationName: dto.stationName,
      stationType: dto.stationType,
    });
  }

  async getStationsByOutlet(outletId: string) {
    return this.repo.findKdsStationsByOutlet(outletId);
  }

  async getActiveKitchenQueue(outletId: string) {
    const kitchenOrders = await this.repo.findActiveKitchenOrders(outletId);

    const now = Date.now();
    return kitchenOrders.map((ko) => {
      const waitTimeMinutes = Math.floor(
        (now - new Date(ko.sentAt).getTime()) / (1000 * 60),
      );
      return {
        ...ko,
        waitTimeMinutes,
        isDelayedAlert: waitTimeMinutes >= 15,
      };
    });
  }

  async updateKitchenOrderStatus(ticketId: string, dto: UpdateKdsOrderStatusDto) {
    const ticket = await this.repo.findKitchenOrderById(ticketId);
    if (!ticket) throw new NotFoundException(`Kitchen ticket ${ticketId} not found`);

    const updateData: any = { status: dto.status };
    if (dto.status === 'ready' || dto.status === 'served') {
      updateData.preparedAt = new Date();
    }

    const updated = await this.repo.updateKitchenOrder(ticketId, updateData);

    // If served and dining table exists, update table to 'dining'
    if (dto.status === 'served' && ticket.order?.tableId) {
      await this.repo.updateTable(ticket.order.tableId, { status: 'dining' });
    }

    return updated;
  }
}
