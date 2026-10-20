import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { ChargeToRoomDto } from '../dto/room-charge.dto.js';

@Injectable()
export class PosRoomChargeService {
  constructor(private readonly prisma: PrismaService) {}

  async verifyRoomForCharge(propertyId: string, roomNumber: string) {
    const room = await this.prisma.room.findFirst({
      where: {
        roomNumber,
        roomType: { propertyId },
      },
      include: {
        roomType: true,
      },
    });

    if (!room) {
      throw new NotFoundException(`Room ${roomNumber} not found in this property`);
    }

    // Query active checked-in booking for this property
    const activeBooking = await this.prisma.booking.findFirst({
      where: {
        propertyId,
        bookingStatus: 'checked_in',
      },
      include: {
        guest: true,
        folios: {
          where: { status: 'open' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!activeBooking) {
      return {
        roomNumber,
        isOccupied: false,
        message: `Room ${roomNumber} has no active checked-in guest`,
      };
    }

    const openFolio = activeBooking.folios[0];

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
      creditLimit: 2000.0, // Standard pre-authorized credit limit
    };
  }

  async chargeToRoom(dto: ChargeToRoomDto) {
    const order = await this.prisma.posOrder.findUnique({
      where: { id: dto.orderId },
      include: { outlet: true },
    });
    if (!order) throw new NotFoundException(`POS Order ${dto.orderId} not found`);

    if (order.status === 'completed') {
      throw new BadRequestException('Order is already settled');
    }

    // Verify room booking
    const activeBooking = await this.prisma.booking.findFirst({
      where: {
        bookingStatus: 'checked_in',
      },
      include: {
        folios: {
          where: { status: 'open' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Get or create folio for the active guest
    let folio = activeBooking?.folios[0];
    if (!folio && activeBooking) {
      folio = await this.prisma.guestFolio.create({
        data: {
          bookingId: activeBooking.id,
          folioNumber: `FOL-${Date.now().toString().slice(-6)}`,
          status: 'open',
          totalCharges: 0,
          totalPayments: 0,
          balanceDue: 0,
        },
      });
    }

    // 1. Create Room Charge Audit Log
    const roomChargeLog = await this.prisma.posRoomChargeLog.create({
      data: {
        orderId: dto.orderId,
        roomNumber: dto.roomNumber,
        guestName: dto.guestName,
        amount: dto.amount,
        signatureUrl: dto.signatureUrl,
      },
    });

    // 2. Post Debit to Guest Folio
    if (folio) {
      await this.prisma.folioTransaction.create({
        data: {
          folioId: folio.id,
          transactionType: 'charge',
          department: 'pos_restaurant',
          amount: dto.amount,
        },
      });

      const updatedCharges = Number(folio.totalCharges) + Number(dto.amount);
      const updatedBalance = Number(folio.balanceDue) + Number(dto.amount);

      await this.prisma.guestFolio.update({
        where: { id: folio.id },
        data: {
          totalCharges: updatedCharges,
          balanceDue: updatedBalance,
        },
      });
    }

    // 3. Record Payment on POS Order
    const payment = await this.prisma.posPayment.create({
      data: {
        orderId: dto.orderId,
        paymentMode: 'room_charge',
        amount: dto.amount,
        reference: `ROOM-CHARGE-${dto.roomNumber}-${roomChargeLog.id.slice(0, 8)}`,
      },
    });

    // 4. Update POS Order status if fully covered
    const existingPayments = await this.prisma.posPayment.findMany({
      where: { orderId: dto.orderId },
    });
    const totalPaid = existingPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    if (totalPaid >= Number(order.totalAmount)) {
      await this.prisma.posOrder.update({
        where: { id: dto.orderId },
        data: { status: 'completed' },
      });

      if (order.tableId) {
        await this.prisma.diningTable.update({
          where: { id: order.tableId },
          data: { status: 'cleaning' },
        });
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
