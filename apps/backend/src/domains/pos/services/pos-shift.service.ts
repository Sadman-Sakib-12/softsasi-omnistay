import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CloseCashierShiftDto, OpenCashierShiftDto, RecordCashDropDto } from '../dto/pos-shift.dto.js';

@Injectable()
export class PosShiftService {
  constructor(private readonly prisma: PrismaService) {}

  async openShift(dto: OpenCashierShiftDto) {
    // Check if terminal has open shift
    const existingActiveShift = await this.prisma.posCashierShift.findFirst({
      where: {
        terminalId: dto.terminalId,
        endedAt: null,
      },
    });

    if (existingActiveShift) {
      throw new BadRequestException(
        `Terminal already has an active open shift (Shift ID: ${existingActiveShift.id})`,
      );
    }

    return this.prisma.posCashierShift.create({
      data: {
        terminalId: dto.terminalId,
        cashierName: dto.cashierName,
        openingFloat: dto.openingFloat || 500.0,
      },
    });
  }

  async recordCashDrop(shiftId: string, dto: RecordCashDropDto) {
    const shift = await this.prisma.posCashierShift.findUnique({
      where: { id: shiftId },
    });
    if (!shift || shift.endedAt) {
      throw new BadRequestException('Active open shift not found');
    }

    return this.prisma.posCashDrop.create({
      data: {
        shiftId,
        amount: dto.amount,
        reason: dto.reason || 'safe_drop',
      },
    });
  }

  async generateXReport(shiftId: string) {
    const shift = await this.prisma.posCashierShift.findUnique({
      where: { id: shiftId },
      include: {
        terminal: { include: { orders: { include: { payments: true } } } },
        cashDrops: true,
      },
    });
    if (!shift) throw new NotFoundException(`Shift ${shiftId} not found`);

    // Sum payments processed during this shift
    const shiftStartTime = shift.startedAt;
    const allPayments = await this.prisma.posPayment.findMany({
      where: {
        order: { terminalId: shift.terminalId },
        paidAt: { gte: shiftStartTime },
      },
    });

    let cashTotal = 0;
    let cardTotal = 0;
    let roomChargeTotal = 0;
    let otherTotal = 0;

    for (const p of allPayments) {
      const amt = Number(p.amount);
      if (p.paymentMode === 'cash') cashTotal += amt;
      else if (p.paymentMode === 'card') cardTotal += amt;
      else if (p.paymentMode === 'room_charge') roomChargeTotal += amt;
      else otherTotal += amt;
    }

    const totalSales = cashTotal + cardTotal + roomChargeTotal + otherTotal;
    const totalCashDrops = shift.cashDrops.reduce((acc, d) => acc + Number(d.amount), 0);
    const expectedDrawerCash = Number(shift.openingFloat) + cashTotal - totalCashDrops;

    // Save X-Report snapshot
    const xReport = await this.prisma.posXReport.create({
      data: {
        shiftId,
        totalSales,
        cashTotal,
        cardTotal,
      },
    });

    return {
      reportType: 'X-Report (Mid-Shift Audit Snapshot)',
      shiftId,
      terminalId: shift.terminalId,
      cashierName: shift.cashierName,
      openedAt: shift.startedAt,
      snapshotTime: xReport.generatedAt,
      openingFloat: Number(shift.openingFloat),
      salesBreakdown: {
        cashTotal,
        cardTotal,
        roomChargeTotal,
        otherTotal,
        totalSales,
      },
      cashDropsTotal: totalCashDrops,
      expectedDrawerCash,
      xReportId: xReport.id,
    };
  }

  async closeShiftAndGenerateZReport(shiftId: string, dto: CloseCashierShiftDto) {
    const shift = await this.prisma.posCashierShift.findUnique({
      where: { id: shiftId },
      include: { cashDrops: true },
    });
    if (!shift) throw new NotFoundException(`Shift ${shiftId} not found`);
    if (shift.endedAt) throw new BadRequestException('Shift is already closed');

    // Aggregate payments
    const allPayments = await this.prisma.posPayment.findMany({
      where: {
        order: { terminalId: shift.terminalId },
        paidAt: { gte: shift.startedAt },
      },
    });

    let cashTotal = 0;
    let cardTotal = 0;
    let roomChargeTotal = 0;

    for (const p of allPayments) {
      const amt = Number(p.amount);
      if (p.paymentMode === 'cash') cashTotal += amt;
      else if (p.paymentMode === 'card') cardTotal += amt;
      else if (p.paymentMode === 'room_charge') roomChargeTotal += amt;
    }

    const totalSales = cashTotal + cardTotal + roomChargeTotal;
    const totalCashDrops = shift.cashDrops.reduce((acc, d) => acc + Number(d.amount), 0);
    const expectedDrawerCash = Number(shift.openingFloat) + cashTotal - totalCashDrops;
    const discrepancy = Number((dto.physicalCashCounted - expectedDrawerCash).toFixed(2));

    // Create Z-Report
    const zReport = await this.prisma.posZReport.create({
      data: {
        shiftId,
        totalSales,
        discrepancy,
      },
    });

    // Close Shift
    await this.prisma.posCashierShift.update({
      where: { id: shiftId },
      data: {
        closingCash: dto.physicalCashCounted,
        endedAt: new Date(),
      },
    });

    return {
      reportType: 'Z-Report (Permanent End-of-Shift Closure)',
      shiftId,
      terminalId: shift.terminalId,
      cashierName: shift.cashierName,
      openedAt: shift.startedAt,
      closedAt: zReport.closedAt,
      openingFloat: Number(shift.openingFloat),
      physicalCashCounted: dto.physicalCashCounted,
      expectedDrawerCash,
      discrepancy,
      discrepancyStatus: discrepancy === 0 ? 'BALANCED' : discrepancy > 0 ? 'OVERAGE' : 'SHORTAGE',
      totalSales,
      salesBreakdown: {
        cashTotal,
        cardTotal,
        roomChargeTotal,
      },
      zReportId: zReport.id,
      notes: dto.notes,
    };
  }
}
