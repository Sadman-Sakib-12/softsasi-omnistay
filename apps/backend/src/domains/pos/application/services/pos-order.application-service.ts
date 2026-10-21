import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  POS_REPOSITORY_TOKEN,
  type IPosRepository,
} from '../../domain/repositories/pos.repository.interface.js';
import type {
  CreatePosOrderDto,
  SettlePosOrderDto,
  SplitCheckDto,
} from '../../presentation/dto/pos-order.dto.js';

@Injectable()
export class PosOrderApplicationService {
  constructor(
    @Inject(POS_REPOSITORY_TOKEN)
    private readonly repo: IPosRepository,
  ) {}

  async createOrder(tenantId: string, dto: CreatePosOrderDto) {
    const outlet = await this.repo.findOutletById(tenantId, dto.outletId);
    if (!outlet) throw new NotFoundException('POS Outlet not found for tenant');

    let subtotal = 0;
    const itemsData = dto.items.map((item) => {
      let itemTotal = Number(item.unitPrice) * item.quantity;
      if (item.modifiers && item.modifiers.length > 0) {
        const modSum = item.modifiers.reduce((acc, m) => acc + Number(m.price), 0);
        itemTotal += modSum * item.quantity;
      }
      subtotal += itemTotal;

      return {
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: itemTotal,
        notes: item.notes,
        modifiers:
          item.modifiers && item.modifiers.length > 0
            ? {
                create: item.modifiers.map((m) => ({
                  name: m.name,
                  price: m.price,
                })),
              }
            : undefined,
      };
    });

    // Standard 10% hospitality service charge and 5% dining tax
    const serviceCharge = Number((subtotal * 0.1).toFixed(2));
    const taxAmount = Number((subtotal * 0.05).toFixed(2));
    const totalAmount = Number((subtotal + serviceCharge + taxAmount).toFixed(2));

    const orderNumber = `POS-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 900 + 100,
    )}`;

    const order = await this.repo.createOrder({
      outletId: dto.outletId,
      terminalId: dto.terminalId,
      tableId: dto.tableId,
      orderNumber,
      guestCount: dto.guestCount || 1,
      subtotal,
      serviceCharge,
      taxAmount,
      totalAmount,
      status: 'open',
      serverName: dto.serverName || 'Waitstaff',
      items: {
        create: itemsData,
      },
    });

    // If dining table attached, update status to 'cooking'
    if (dto.tableId) {
      await this.repo.updateTable(dto.tableId, { status: 'cooking' });
    }

    // Auto-create Kitchen Display System (KDS) order
    const defaultStation = await this.repo.findDefaultKdsStation(dto.outletId);

    await this.repo.createKitchenOrder({
      orderId: order.id,
      stationId: defaultStation?.id,
      ticketNumber: `KDS-${order.orderNumber.slice(-4)}`,
      status: 'queued',
    });

    return order;
  }

  async getOrderById(orderId: string) {
    const order = await this.repo.findOrderById(orderId);
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    return order;
  }

  async settleOrder(orderId: string, dto: SettlePosOrderDto) {
    const order = await this.getOrderById(orderId);
    if (order.status === 'completed') {
      throw new BadRequestException('Order is already settled and closed');
    }

    const payment = await this.repo.createPayment({
      orderId,
      paymentMode: dto.paymentMode,
      amount: dto.amount,
      tipAmount: dto.tipAmount || 0,
      reference: dto.reference || `PAY-${Date.now().toString().slice(-6)}`,
    });

    const existingPayments = await this.repo.findPaymentsByOrderId(orderId);
    const totalPaid = existingPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    let updatedStatus = order.status;
    if (totalPaid >= Number(order.totalAmount)) {
      updatedStatus = 'completed';
      await this.repo.updateOrder(orderId, { status: 'completed' });

      // Update table status to 'cleaning'
      if (order.tableId) {
        await this.repo.updateTable(order.tableId, { status: 'cleaning' });
      }
    }

    return {
      message: 'Payment recorded successfully',
      orderId,
      payment,
      totalAmount: order.totalAmount,
      totalPaid,
      balanceRemaining: Math.max(0, Number(order.totalAmount) - totalPaid),
      isSettled: updatedStatus === 'completed',
    };
  }

  async splitCheck(orderId: string, dto: SplitCheckDto) {
    const order = await this.getOrderById(orderId);
    const total = Number(order.totalAmount);
    const perPerson = Number((total / dto.splitCount).toFixed(2));
    const splits = [];

    for (let i = 1; i <= dto.splitCount; i++) {
      splits.push({
        seatOrSplitNumber: i,
        amount:
          i === dto.splitCount
            ? Number((total - perPerson * (dto.splitCount - 1)).toFixed(2))
            : perPerson,
        currency: 'USD',
        status: 'unpaid',
      });
    }

    return {
      orderId,
      orderNumber: order.orderNumber,
      totalAmount: total,
      splitCount: dto.splitCount,
      splits,
    };
  }
}
