import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  POS_REPOSITORY_TOKEN,
  type IPosRepository,
} from '../../domain/repositories/pos.repository.interface.js';
import { calculateShiftVariance } from '../../domain/rules/pos.rule.js';
import type {
  CloseCashierShiftDto,
  OpenCashierShiftDto,
  RecordCashDropDto,
} from '../../presentation/dto/pos-shift.dto.js';

@Injectable()
export class PosShiftApplicationService {
  constructor(
    @Inject(POS_REPOSITORY_TOKEN)
    private readonly repo: IPosRepository,
  ) {}

  async openShift(dto: OpenCashierShiftDto) {
    const existingActiveShift = await this.repo.findActiveShiftByTerminal(dto.terminalId);

    if (existingActiveShift) {
      throw new BadRequestException(
        `Terminal already has an active open shift (Shift ID: ${existingActiveShift.id})`,
      );
    }

    return this.repo.createShift({
      terminalId: dto.terminalId,
      cashierName: dto.cashierName,
      openingFloat: dto.openingFloat || 500.0,
    });
  }

  async recordCashDrop(shiftId: string, dto: RecordCashDropDto) {
    const shift = await this.repo.findShiftById(shiftId);
    if (!shift || shift.endedAt) {
      throw new BadRequestException('Active open shift not found');
    }

    return this.repo.createCashDrop({
      shiftId,
      amount: dto.amount,
      reason: dto.reason || 'safe_drop',
    });
  }

  async generateXReport(shiftId: string) {
    const shift = await this.repo.findShiftById(shiftId);
    if (!shift) throw new NotFoundException(`Shift ${shiftId} not found`);

    const shiftStartTime = shift.startedAt;
    const allPayments = await this.repo.findPaymentsForShift(shift.terminalId, shiftStartTime);

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
    const totalCashDrops = (shift.cashDrops || []).reduce(
      (acc: number, d: any) => acc + Number(d.amount),
      0,
    );
    const expectedDrawerCash = Number(shift.openingFloat) + cashTotal - totalCashDrops;

    const xReport = await this.repo.createXReport({
      shiftId,
      totalSales,
      cashTotal,
      cardTotal,
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
    const shift = await this.repo.findShiftById(shiftId);
    if (!shift) throw new NotFoundException(`Shift ${shiftId} not found`);
    if (shift.endedAt) throw new BadRequestException('Shift is already closed');

    const allPayments = await this.repo.findPaymentsForShift(shift.terminalId, shift.startedAt);

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
    const totalCashDrops = (shift.cashDrops || []).reduce(
      (acc: number, d: any) => acc + Number(d.amount),
      0,
    );
    const expectedDrawerCash = Number(shift.openingFloat) + cashTotal - totalCashDrops;

    const { variance: discrepancy, status } = calculateShiftVariance(
      dto.physicalCashCounted,
      expectedDrawerCash,
    );

    const zReport = await this.repo.createZReport({
      shiftId,
      totalSales,
      discrepancy,
    });

    await this.repo.updateShift(shiftId, {
      closingCash: dto.physicalCashCounted,
      endedAt: new Date(),
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
      discrepancyStatus: status === 'balanced' ? 'BALANCED' : status === 'overage' ? 'OVERAGE' : 'SHORTAGE',
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
