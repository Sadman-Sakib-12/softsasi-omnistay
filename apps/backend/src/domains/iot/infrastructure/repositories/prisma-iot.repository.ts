import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IIotRepository } from '../../domain/repositories/iot.repository.interface.js';

@Injectable()
export class PrismaIotRepository implements IIotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createLock(data: any) {
    return this.prisma.iotSmartLock.create({ data });
  }

  async findLockById(id: string) {
    return this.prisma.iotSmartLock.findUnique({
      where: { id },
      include: { keys: true, accessLogs: { orderBy: { accessedAt: 'desc' }, take: 10 } },
    });
  }

  async findLockByRoomId(roomId: string) {
    return this.prisma.iotSmartLock.findFirst({
      where: { roomId },
      include: { keys: { where: { isRevoked: false } } },
    });
  }

  async findLockBySerial(deviceSerial: string) {
    return this.prisma.iotSmartLock.findUnique({ where: { deviceSerial } });
  }

  async updateLock(id: string, data: Record<string, any>) {
    return this.prisma.iotSmartLock.update({ where: { id }, data });
  }

  async listLocks() {
    return this.prisma.iotSmartLock.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { accessLogs: { orderBy: { accessedAt: 'desc' }, take: 1 } },
    });
  }

  async createLockKey(data: any) {
    return this.prisma.iotSmartLockKey.create({ data });
  }

  async findLockKeyByToken(token: string) {
    return this.prisma.iotSmartLockKey.findFirst({
      where: { keyToken: token, isRevoked: false },
      include: { lock: true },
    });
  }

  async revokeLockKey(id: string) {
    return this.prisma.iotSmartLockKey.update({
      where: { id },
      data: { isRevoked: true },
    });
  }

  async createAccessLog(data: any) {
    return this.prisma.iotLockAccessLog.create({ data });
  }

  async findAccessLogs(lockId: string) {
    return this.prisma.iotLockAccessLog.findMany({
      where: { lockId },
      orderBy: { accessedAt: 'desc' },
      take: 50,
    });
  }

  async createThermostat(data: any) {
    return this.prisma.iotThermostat.create({ data });
  }

  async findThermostatById(id: string) {
    return this.prisma.iotThermostat.findUnique({
      where: { id },
      include: { energyLogs: { orderBy: { loggedDate: 'desc' }, take: 14 } },
    });
  }

  async findThermostatByRoomId(roomId: string) {
    return this.prisma.iotThermostat.findFirst({ where: { roomId } });
  }

  async updateThermostat(id: string, data: Record<string, any>) {
    return this.prisma.iotThermostat.update({ where: { id }, data });
  }

  async listThermostats() {
    return this.prisma.iotThermostat.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async createEnergyLog(data: any) {
    return this.prisma.iotEnergyLog.create({ data });
  }

  async findEnergyLogs(thermostatId: string) {
    return this.prisma.iotEnergyLog.findMany({
      where: { thermostatId },
      orderBy: { loggedDate: 'desc' },
      take: 30,
    });
  }

  async createRoomQrOrder(data: {
    roomId: string;
    orderNumber: string;
    totalAmount: number;
    status?: string;
    items: { itemTitle: string; quantity: number; price: number }[];
  }) {
    const { items, ...orderData } = data;
    return this.prisma.roomQrOrder.create({
      data: {
        ...orderData,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });
  }

  async findRoomQrOrderById(id: string) {
    return this.prisma.roomQrOrder.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async findRoomQrOrdersByRoomId(roomId: string) {
    return this.prisma.roomQrOrder.findMany({
      where: { roomId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRoomQrOrderStatus(id: string, status: string) {
    return this.prisma.roomQrOrder.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }
}
