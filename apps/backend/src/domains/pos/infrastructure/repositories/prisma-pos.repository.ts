import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IPosRepository } from '../../domain/repositories/pos.repository.interface.js';

@Injectable()
export class PrismaPosRepository implements IPosRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Outlets & Tables
  async createOutlet(data: any): Promise<any> {
    return this.prisma.posOutlet.create({
      data,
      include: { tables: true, terminals: true },
    });
  }

  async findOutlets(tenantId: string): Promise<any[]> {
    return this.prisma.posOutlet.findMany({
      where: { tenantId },
      include: { tables: true, terminals: true, kdsStations: true },
    });
  }

  async findOutletById(tenantId: string, id: string): Promise<any | null> {
    return this.prisma.posOutlet.findFirst({
      where: { id, tenantId },
      include: {
        tables: true,
        terminals: true,
        floorPlans: true,
        menus: {
          include: {
            categories: {
              include: { items: { include: { modifiers: true } } },
            },
          },
        },
        kdsStations: true,
      },
    });
  }

  async createTable(data: any): Promise<any> {
    return this.prisma.diningTable.create({ data });
  }

  async findTableById(id: string): Promise<any | null> {
    return this.prisma.diningTable.findUnique({
      where: { id },
      include: { orders: { where: { status: 'open' } } },
    });
  }

  async updateTable(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.diningTable.update({ where: { id }, data });
  }

  async updateManyOrders(where: Record<string, any>, data: Record<string, any>): Promise<any> {
    return this.prisma.posOrder.updateMany({ where, data });
  }

  // Menus & Items
  async createMenu(data: any): Promise<any> {
    return this.prisma.posMenu.create({ data });
  }

  async findMenusByOutlet(outletId: string): Promise<any[]> {
    return this.prisma.posMenu.findMany({
      where: { outletId },
      include: {
        categories: {
          orderBy: { displayOrder: 'asc' },
          include: {
            items: { include: { modifiers: true } },
          },
        },
      },
    });
  }

  async createCategory(data: any): Promise<any> {
    return this.prisma.posMenuCategory.create({ data });
  }

  async createMenuItem(data: any): Promise<any> {
    return this.prisma.posMenuItem.create({
      data,
      include: { modifiers: true },
    });
  }

  async findMenuItemById(id: string): Promise<any | null> {
    return this.prisma.posMenuItem.findUnique({ where: { id } });
  }

  async updateMenuItem(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.posMenuItem.update({ where: { id }, data });
  }

  // Orders & Payments
  async createOrder(data: any): Promise<any> {
    return this.prisma.posOrder.create({
      data,
      include: {
        items: { include: { modifiers: true } },
        table: true,
      },
    });
  }

  async findOrderById(id: string): Promise<any | null> {
    return this.prisma.posOrder.findUnique({
      where: { id },
      include: {
        items: { include: { modifiers: true } },
        payments: true,
        kitchenOrders: { include: { station: true } },
        table: true,
        roomChargeLogs: true,
        outlet: true,
      },
    });
  }

  async updateOrder(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.posOrder.update({ where: { id }, data });
  }

  async createPayment(data: any): Promise<any> {
    return this.prisma.posPayment.create({ data });
  }

  async findPaymentsByOrderId(orderId: string): Promise<any[]> {
    return this.prisma.posPayment.findMany({ where: { orderId } });
  }

  // KDS
  async createKdsStation(data: any): Promise<any> {
    return this.prisma.kdsStation.create({ data });
  }

  async findDefaultKdsStation(outletId: string): Promise<any | null> {
    return this.prisma.kdsStation.findFirst({ where: { outletId } });
  }

  async createKitchenOrder(data: any): Promise<any> {
    return this.prisma.posKitchenOrder.create({ data });
  }

  async findKdsStationsByOutlet(outletId: string): Promise<any[]> {
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

  async findActiveKitchenOrders(outletId: string): Promise<any[]> {
    return this.prisma.posKitchenOrder.findMany({
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
  }

  async findKitchenOrderById(id: string): Promise<any | null> {
    return this.prisma.posKitchenOrder.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  async updateKitchenOrder(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.posKitchenOrder.update({ where: { id }, data });
  }

  // Room Charge Integration
  async findRoomByNumber(propertyId: string, roomNumber: string): Promise<any | null> {
    return this.prisma.room.findFirst({
      where: {
        roomNumber,
        roomType: { propertyId },
      },
      include: { roomType: true },
    });
  }

  async findActiveBooking(propertyId?: string): Promise<any | null> {
    const where: any = { bookingStatus: 'checked_in' };
    if (propertyId) where.propertyId = propertyId;
    return this.prisma.booking.findFirst({
      where,
      include: {
        guest: true,
        folios: {
          where: { status: 'open' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async createFolio(data: any): Promise<any> {
    return this.prisma.guestFolio.create({ data });
  }

  async createFolioTransaction(data: any): Promise<any> {
    return this.prisma.folioTransaction.create({ data });
  }

  async updateFolio(folioId: string, data: Record<string, any>): Promise<any> {
    return this.prisma.guestFolio.update({ where: { id: folioId }, data });
  }

  async createRoomChargeLog(data: any): Promise<any> {
    return this.prisma.posRoomChargeLog.create({ data });
  }

  // Cashier Shifts & Reports
  async findActiveShiftByTerminal(terminalId: string): Promise<any | null> {
    return this.prisma.posCashierShift.findFirst({
      where: { terminalId, endedAt: null },
    });
  }

  async findShiftById(id: string): Promise<any | null> {
    return this.prisma.posCashierShift.findUnique({
      where: { id },
      include: {
        terminal: { include: { orders: { include: { payments: true } } } },
        cashDrops: true,
      },
    });
  }

  async createShift(data: any): Promise<any> {
    return this.prisma.posCashierShift.create({ data });
  }

  async createCashDrop(data: any): Promise<any> {
    return this.prisma.posCashDrop.create({ data });
  }

  async findPaymentsForShift(terminalId: string, sinceDate: Date): Promise<any[]> {
    return this.prisma.posPayment.findMany({
      where: {
        order: { terminalId },
        paidAt: { gte: sinceDate },
      },
    });
  }

  async createXReport(data: any): Promise<any> {
    return this.prisma.posXReport.create({ data });
  }

  async createZReport(data: any): Promise<any> {
    return this.prisma.posZReport.create({ data });
  }

  async updateShift(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.posCashierShift.update({ where: { id }, data });
  }
}
