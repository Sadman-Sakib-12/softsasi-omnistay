import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'node:crypto';
import type { IIotRepository } from '../../domain/repositories/iot.repository.interface.js';
import { IOT_REPOSITORY_TOKEN } from '../../domain/repositories/iot.repository.interface.js';
import { CreateRoomQrOrderDto } from '../../presentation/dto/iot.dto.js';

@Injectable()
export class RoomQrService {
  constructor(
    @Inject(IOT_REPOSITORY_TOKEN)
    private readonly repo: IIotRepository,
  ) {}

  async createQrOrder(dto: CreateRoomQrOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const totalAmount = dto.items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
    const orderNumber = `QR-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    return this.repo.createRoomQrOrder({
      roomId: dto.roomId,
      orderNumber,
      totalAmount,
      status: 'received_at_kitchen',
      items: dto.items,
    });
  }

  async getOrder(id: string) {
    const order = await this.repo.findRoomQrOrderById(id);
    if (!order) throw new NotFoundException('In-room QR dining order not found');
    return order;
  }

  async getOrdersByRoom(roomId: string) {
    return this.repo.findRoomQrOrdersByRoomId(roomId);
  }

  async updateOrderStatus(id: string, status: string) {
    await this.getOrder(id);
    return this.repo.updateRoomQrOrderStatus(id, status);
  }
}
