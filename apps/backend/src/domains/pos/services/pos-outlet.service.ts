import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import {
  CreateDiningTableDto,
  CreatePosOutletDto,
  MergeTablesDto,
  TransferTableDto,
  UpdateTablePositionDto,
} from '../dto/pos-outlet.dto.js';

@Injectable()
export class PosOutletService {
  constructor(private readonly prisma: PrismaService) {}

  async createOutlet(tenantId: string, dto: CreatePosOutletDto) {
    return this.prisma.posOutlet.create({
      data: {
        tenantId,
        outletName: dto.outletName,
        outletType: dto.outletType,
        isActive: dto.isActive ?? true,
      },
      include: {
        tables: true,
        terminals: true,
      },
    });
  }

  async getOutlets(tenantId: string) {
    return this.prisma.posOutlet.findMany({
      where: { tenantId },
      include: {
        tables: true,
        terminals: true,
        kdsStations: true,
      },
    });
  }

  async getOutletById(tenantId: string, outletId: string) {
    const outlet = await this.prisma.posOutlet.findFirst({
      where: { id: outletId, tenantId },
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
    if (!outlet) throw new NotFoundException(`Outlet with ID ${outletId} not found`);
    return outlet;
  }

  async createTable(tenantId: string, outletId: string, dto: CreateDiningTableDto) {
    await this.getOutletById(tenantId, outletId);
    return this.prisma.diningTable.create({
      data: {
        outletId,
        tableNumber: dto.tableNumber,
        seatingCap: dto.seatingCap,
        status: dto.status || 'vacant',
        posX: dto.posX || 0,
        posY: dto.posY || 0,
      },
    });
  }

  async updateTablePosition(tableId: string, dto: UpdateTablePositionDto) {
    return this.prisma.diningTable.update({
      where: { id: tableId },
      data: {
        posX: dto.posX,
        posY: dto.posY,
      },
    });
  }

  async updateTableStatus(tableId: string, status: string) {
    return this.prisma.diningTable.update({
      where: { id: tableId },
      data: { status },
    });
  }

  async transferTable(dto: TransferTableDto) {
    const sourceTable = await this.prisma.diningTable.findUnique({
      where: { id: dto.sourceTableId },
      include: { orders: { where: { status: 'open' } } },
    });
    const targetTable = await this.prisma.diningTable.findUnique({
      where: { id: dto.targetTableId },
    });

    if (!sourceTable || !targetTable) {
      throw new NotFoundException('Source or target table not found');
    }

    if (targetTable.status !== 'vacant') {
      throw new BadRequestException(`Target table ${targetTable.tableNumber} is not vacant`);
    }

    // Move active open orders to target table
    await this.prisma.posOrder.updateMany({
      where: { tableId: sourceTable.id, status: 'open' },
      data: { tableId: targetTable.id },
    });

    // Update statuses
    await this.prisma.diningTable.update({
      where: { id: sourceTable.id },
      data: { status: 'vacant' },
    });
    await this.prisma.diningTable.update({
      where: { id: targetTable.id },
      data: { status: 'seated' },
    });

    return {
      message: `Successfully transferred party from Table ${sourceTable.tableNumber} to Table ${targetTable.tableNumber}`,
      sourceTableId: sourceTable.id,
      targetTableId: targetTable.id,
      reason: dto.reason || 'Guest requested move',
    };
  }

  async mergeTables(dto: MergeTablesDto) {
    const primary = await this.prisma.diningTable.findUnique({ where: { id: dto.primaryTableId } });
    if (!primary) throw new NotFoundException('Primary table not found');

    for (const secId of dto.mergedTableIds) {
      // Re-assign open orders from secondary tables to primary
      await this.prisma.posOrder.updateMany({
        where: { tableId: secId, status: 'open' },
        data: { tableId: primary.id },
      });
      // Set secondary table status to dining (part of merged party)
      await this.prisma.diningTable.update({
        where: { id: secId },
        data: { status: 'dining' },
      });
    }

    await this.prisma.diningTable.update({
      where: { id: primary.id },
      data: { status: 'dining' },
    });

    return {
      message: `Tables merged successfully into primary table ${primary.tableNumber}`,
      primaryTableId: primary.id,
      mergedTableIds: dto.mergedTableIds,
    };
  }
}
