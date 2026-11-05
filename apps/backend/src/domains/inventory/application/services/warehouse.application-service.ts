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
    let list = await this.repo.findWarehouses(tenantId);
    if (!list || list.length === 0) {
      await this.seedDefaultWarehouses(tenantId);
      list = await this.repo.findWarehouses(tenantId);
    }
    return list;
  }

  private async seedDefaultWarehouses(tenantId: string) {
    const defaults = [
      {
        name: 'Central Logistics Depot (Basement 2)',
        code: 'WH-CRW-01',
        address: 'B2 Primary Inbound Receiving Depot',
        bins: [
          { binCode: 'BIN-PLT-A1', zone: 'Zone A - Pallet Racks' },
          { binCode: 'BIN-BLK-A2', zone: 'Zone B - Bulk Receiving' },
        ],
      },
      {
        name: 'Culinary Cold Room & Dry Pantry',
        code: 'WH-KCS-02',
        address: 'Kitchen Main Walk-in Freezer (-18°C)',
        bins: [
          { binCode: 'BIN-FRZ-C1', zone: 'Zone C - Walk-in Freezer' },
          { binCode: 'BIN-CHL-D1', zone: 'Zone D - Meat Chiller' },
        ],
      },
      {
        name: 'Sommelier Beverage & Wine Cellar',
        code: 'WH-BWC-03',
        address: 'Level -1 Sommelier Cellar 12°C',
        bins: [
          { binCode: 'BIN-WIN-E1', zone: 'Zone E - Vintage Bordeaux' },
          { binCode: 'BIN-SPR-F1', zone: 'Zone F - Spirits Vault' },
        ],
      },
      {
        name: 'Floor 3 & 4 Housekeeping Linen Storage',
        code: 'WH-HLC-04',
        address: 'Level 3 Clean Linen Par Cupboard',
        bins: [
          { binCode: 'BIN-LIN-G1', zone: 'Zone G - Bath Linens' },
          { binCode: 'BIN-SHT-H1', zone: 'Zone H - Bed Sheets' },
        ],
      },
      {
        name: 'Mobile Mini-Bar Replenishment Fleet',
        code: 'WH-MBC-05',
        address: 'Floors 1-8 Mobile Service Carts',
        bins: [{ binCode: 'BIN-CRT-M1', zone: 'Zone M - Cart Replenishment' }],
      },
    ];

    for (const d of defaults) {
      try {
        const wh = await this.repo.createWarehouse({
          tenantId,
          name: d.name,
          code: d.code,
          address: d.address,
          isActive: true,
        });
        for (const b of d.bins) {
          await this.repo.createBin({
            warehouseId: wh.id,
            binCode: b.binCode,
            zone: b.zone,
          });
        }
      } catch {
        // Skip duplicate or race condition
      }
    }
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
