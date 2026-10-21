import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  POS_REPOSITORY_TOKEN,
  type IPosRepository,
} from '../../domain/repositories/pos.repository.interface.js';
import type {
  CreateDiningTableDto,
  CreatePosOutletDto,
  MergeTablesDto,
  TransferTableDto,
  UpdateTablePositionDto,
} from '../../presentation/dto/pos-outlet.dto.js';

@Injectable()
export class PosOutletApplicationService {
  constructor(
    @Inject(POS_REPOSITORY_TOKEN)
    private readonly repo: IPosRepository,
  ) {}

  async createOutlet(tenantId: string, dto: CreatePosOutletDto) {
    return this.repo.createOutlet({
      tenantId,
      outletName: dto.outletName,
      outletType: dto.outletType,
      isActive: dto.isActive ?? true,
    });
  }

  async getOutlets(tenantId: string) {
    return this.repo.findOutlets(tenantId);
  }

  async getOutletById(tenantId: string, outletId: string) {
    const outlet = await this.repo.findOutletById(tenantId, outletId);
    if (!outlet) throw new NotFoundException(`Outlet with ID ${outletId} not found`);
    return outlet;
  }

  async createTable(tenantId: string, outletId: string, dto: CreateDiningTableDto) {
    await this.getOutletById(tenantId, outletId);
    return this.repo.createTable({
      outletId,
      tableNumber: dto.tableNumber,
      seatingCap: dto.seatingCap,
      status: dto.status || 'vacant',
      posX: dto.posX || 0,
      posY: dto.posY || 0,
    });
  }

  async updateTablePosition(tableId: string, dto: UpdateTablePositionDto) {
    return this.repo.updateTable(tableId, {
      posX: dto.posX,
      posY: dto.posY,
    });
  }

  async updateTableStatus(tableId: string, status: string) {
    return this.repo.updateTable(tableId, { status });
  }

  async transferTable(dto: TransferTableDto) {
    const sourceTable = await this.repo.findTableById(dto.sourceTableId);
    const targetTable = await this.repo.findTableById(dto.targetTableId);

    if (!sourceTable || !targetTable) {
      throw new NotFoundException('Source or target table not found');
    }

    if (targetTable.status !== 'vacant') {
      throw new BadRequestException(`Target table ${targetTable.tableNumber} is not vacant`);
    }

    // Move active open orders to target table
    await this.repo.updateManyOrders(
      { tableId: sourceTable.id, status: 'open' },
      { tableId: targetTable.id },
    );

    // Update statuses
    await this.repo.updateTable(sourceTable.id, { status: 'vacant' });
    await this.repo.updateTable(targetTable.id, { status: 'seated' });

    return {
      message: `Successfully transferred party from Table ${sourceTable.tableNumber} to Table ${targetTable.tableNumber}`,
      sourceTableId: sourceTable.id,
      targetTableId: targetTable.id,
      reason: dto.reason || 'Guest requested move',
    };
  }

  async mergeTables(dto: MergeTablesDto) {
    const primary = await this.repo.findTableById(dto.primaryTableId);
    if (!primary) throw new NotFoundException('Primary table not found');

    for (const secId of dto.mergedTableIds) {
      await this.repo.updateManyOrders(
        { tableId: secId, status: 'open' },
        { tableId: primary.id },
      );
      await this.repo.updateTable(secId, { status: 'dining' });
    }

    await this.repo.updateTable(primary.id, { status: 'dining' });

    return {
      message: `Tables merged successfully into primary table ${primary.tableNumber}`,
      primaryTableId: primary.id,
      mergedTableIds: dto.mergedTableIds,
    };
  }
}
