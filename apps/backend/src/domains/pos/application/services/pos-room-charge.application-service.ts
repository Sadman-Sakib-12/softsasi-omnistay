import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  POS_REPOSITORY_TOKEN,
  type IPosRepository,
} from '../../domain/repositories/pos.repository.interface.js';
import type { ChargeToRoomDto } from '../../presentation/dto/room-charge.dto.js';

@Injectable()
export class PosRoomChargeApplicationService {
  constructor(
    @Inject(POS_REPOSITORY_TOKEN)
    private readonly repo: IPosRepository,
  ) {}

  async verifyRoomForCharge(propertyId: string, roomNumber: string) {
    const room = await this.repo.findRoomByNumber(propertyId, roomNumber);

    if (!room) {
      throw new NotFoundException(`Room ${roomNumber} not found in this property`);
    }

    const activeBooking = await this.repo.findActiveBooking(propertyId);

    if (!activeBooking) {
      return {
        roomNumber,
        isOccupied: false,
        message: `Room ${roomNumber} has no active checked-in guest`,
      };
    }

    const openFolio = activeBooking.folios?.[0];

    return {
      roomNumber,
      isOccupied: true,
      guestName: activeBooking.guest?.name || 'In-House Guest',
      guestEmail: activeBooking.guest?.email,
      bookingCode: activeBooking.bookingCode,
      bookingId: activeBooking.id,
      folioId: openFolio?.id,
      folioNumber: openFolio?.folioNumber,
      currentBalanceDue: openFolio ? Number(openFolio.balanceDue) : 0,
      creditLimit: 2000.0,
    };
  }

  async chargeToRoom(dto: ChargeToRoomDto) {
    const order = await this.repo.findOrderById(dto.orderId);
    if (!order) throw new NotFoundException(`POS Order ${dto.orderId} not found`);

    if (order.status === 'completed') {
      throw new BadRequestException('Order is already settled');
    }

    const activeBooking = await this.repo.findActiveBooking();

    let folio = activeBooking?.folios?.[0];
    if (!folio && activeBooking) {
      folio = await this.repo.createFolio({
        bookingId: activeBooking.id,
        folioNumber: `FOL-${Date.now().toString().slice(-6)}`,
        status: 'open',
        totalCharges: 0,
        totalPayments: 0,
        balanceDue: 0,
      });
    }

    // 1. Create Room Charge Audit Log
    const roomChargeLog = await this.repo.createRoomChargeLog({
      orderId: dto.orderId,
      roomNumber: dto.roomNumber,
      guestName: dto.guestName,
      amount: dto.amount,
      signatureUrl: dto.signatureUrl,
    });

    // 2. Post Debit to Guest Folio
    if (folio) {
      await this.repo.createFolioTransaction({
        folioId: folio.id,
        transactionType: 'charge',
        department: 'pos_restaurant',
        amount: dto.amount,
      });

      const updatedCharges = Number(folio.totalCharges) + Number(dto.amount);
      const updatedBalance = Number(folio.balanceDue) + Number(dto.amount);

      await this.repo.updateFolio(folio.id, {
        totalCharges: updatedCharges,
        balanceDue: updatedBalance,
      });
    }

    // 3. Record Payment on POS Order
    const payment = await this.repo.createPayment({
      orderId: dto.orderId,
      paymentMode: 'room_charge',
      amount: dto.amount,
      reference: `ROOM-CHARGE-${dto.roomNumber}-${roomChargeLog.id.slice(0, 8)}`,
    });

    // 4. Update POS Order status if fully covered
    const existingPayments = await this.repo.findPaymentsByOrderId(dto.orderId);
    const totalPaid = existingPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    if (totalPaid >= Number(order.totalAmount)) {
      await this.repo.updateOrder(dto.orderId, { status: 'completed' });

      if (order.tableId) {
        await this.repo.updateTable(order.tableId, { status: 'cleaning' });
      }
    }

    return {
      success: true,
      message: `Charge of $${Number(dto.amount).toFixed(2)} posted directly to Room ${dto.roomNumber} folio`,
      chargeLogId: roomChargeLog.id,
      paymentId: payment.id,
      folioId: folio?.id,
      orderStatus: totalPaid >= Number(order.totalAmount) ? 'completed' : 'partially_paid',
    };
  }
}
