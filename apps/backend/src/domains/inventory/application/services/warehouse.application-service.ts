import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  INVENTORY_REPOSITORY_TOKEN,
  type IInventoryRepository,
} from '../../domain/repositories/inventory.repository.interface.js';
import type {
  CreateWarehouseBinDto,
  CreateWarehouseDto,
  InitiateStockTransferDto,
} from '../../presentation/dto/warehouse.dto.js';

@Injectable()
export class WarehouseApplicationService {
  constructor(
    @Inject(INVENTORY_REPOSITORY_TOKEN)
    private readonly repo: IInventoryRepository,
  ) {}

  async createWarehouse(tenantId: string, dto: CreateWarehouseDto) {
    return this.repo.createWarehouse({
      tenantId,
      name: dto.name,
      code: dto.code,
      address: dto.address,
      isActive: dto.isActive ?? true,
    });
  }

  async getWarehouses(tenantId: string) {
    return this.repo.findWarehouses(tenantId);
  }

  async createBin(warehouseId: string, dto: CreateWarehouseBinDto) {
    const wh = await this.repo.findWarehouseById(warehouseId);
    if (!wh) throw new NotFoundException('Warehouse not found');

    return this.repo.createBin({
      warehouseId,
      binCode: dto.binCode,
      zone: dto.zone,
    });
  }

  async getStockLevel(warehouseId: string, productId: string) {
    const record = await this.repo.findWarehouseProduct(warehouseId, productId);
    return record || { warehouseId, productId, stockQty: 0, reorderLevel: 10 };
  }

  async updateStock(
    warehouseId: string,
    productId: string,
    quantityDelta: number,
    changeType: string,
    reference?: string,
  ) {
    const current = await this.repo.findWarehouseProduct(warehouseId, productId);

    const newQty = (current ? Number(current.stockQty) : 0) + quantityDelta;
    if (newQty < 0) {
      throw new BadRequestException(
        `Insufficient stock in warehouse for product. Available: ${current ? current.stockQty : 0}, Requested deduction: ${Math.abs(quantityDelta)}`,
      );
    }

    const updated = await this.repo.upsertWarehouseProduct(warehouseId, productId, newQty);

    await this.repo.createStockLog({
      warehouseId,
      productId,
      changeQty: quantityDelta,
      changeType,
      reference,
    });

    return updated;
  }

  async initiateStockTransfer(dto: InitiateStockTransferDto) {
    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new BadRequestException('Origin and destination warehouses cannot be the same');
    }

    const originStock = await this.getStockLevel(dto.fromWarehouseId, dto.productId);
    if (Number(originStock.stockQty) < dto.quantity) {
      throw new BadRequestException(
        `Cannot transfer ${dto.quantity}. Only ${originStock.stockQty} in source warehouse.`,
      );
    }

    const transferNumber = `TRF-${Date.now().toString().slice(-6)}`;

    // 1. Deduct from origin
    await this.updateStock(
      dto.fromWarehouseId,
      dto.productId,
      -dto.quantity,
      'transfer_out',
      `Transfer ${transferNumber} to ${dto.toWarehouseId}`,
    );

    // 2. Add to destination
    await this.updateStock(
      dto.toWarehouseId,
      dto.productId,
      dto.quantity,
      'transfer_in',
      `Transfer ${transferNumber} from ${dto.fromWarehouseId}`,
    );

    // 3. Create Transfer record
    const transfer = await this.repo.createWarehouseTransfer({
      fromWarehouseId: dto.fromWarehouseId,
      toWarehouseId: dto.toWarehouseId,
      transferNumber,
      status: 'completed',
      completedAt: new Date(),
    });

    return {
      message: `Successfully transferred ${dto.quantity} units`,
      transferNumber,
      transferId: transfer.id,
      fromWarehouseId: dto.fromWarehouseId,
      toWarehouseId: dto.toWarehouseId,
      quantity: dto.quantity,
      status: 'completed',
    };
  }
}
