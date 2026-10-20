import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateWarehouseBinDto, CreateWarehouseDto, InitiateStockTransferDto } from '../dto/warehouse.dto.js';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async createWarehouse(tenantId: string, dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        address: dto.address,
        isActive: dto.isActive ?? true,
      },
      include: {
        bins: true,
        products: true,
      },
    });
  }

  async getWarehouses(tenantId: string) {
    return this.prisma.warehouse.findMany({
      where: { tenantId },
      include: {
        bins: true,
        products: {
          include: { product: true },
        },
      },
    });
  }

  async createBin(warehouseId: string, dto: CreateWarehouseBinDto) {
    const wh = await this.prisma.warehouse.findUnique({ where: { id: warehouseId } });
    if (!wh) throw new NotFoundException('Warehouse not found');

    return this.prisma.warehouseBin.create({
      data: {
        warehouseId,
        binCode: dto.binCode,
        zone: dto.zone,
      },
    });
  }

  async getStockLevel(warehouseId: string, productId: string) {
    const record = await this.prisma.warehouseProduct.findUnique({
      where: { warehouseId_productId: { warehouseId, productId } },
      include: { product: true, warehouse: true },
    });
    return record || { warehouseId, productId, stockQty: 0, reorderLevel: 10 };
  }

  async updateStock(
    warehouseId: string,
    productId: string,
    quantityDelta: number,
    changeType: string,
    reference?: string,
  ) {
    const current = await this.prisma.warehouseProduct.findUnique({
      where: { warehouseId_productId: { warehouseId, productId } },
    });

    const newQty = (current ? Number(current.stockQty) : 0) + quantityDelta;
    if (newQty < 0) {
      throw new BadRequestException(
        `Insufficient stock in warehouse for product. Available: ${current ? current.stockQty : 0}, Requested deduction: ${Math.abs(quantityDelta)}`,
      );
    }

    const updated = await this.prisma.warehouseProduct.upsert({
      where: { warehouseId_productId: { warehouseId, productId } },
      update: { stockQty: newQty },
      create: {
        warehouseId,
        productId,
        stockQty: Math.max(0, newQty),
        reorderLevel: 10,
      },
    });

    // Record Stock Movement Log
    await this.prisma.inventoryStockLog.create({
      data: {
        warehouseId,
        productId,
        changeQty: quantityDelta,
        changeType,
        reference,
      },
    });

    return updated;
  }

  async initiateStockTransfer(dto: InitiateStockTransferDto) {
    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new BadRequestException('Origin and destination warehouses cannot be the same');
    }

    // Verify origin stock
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
    const transfer = await this.prisma.warehouseTransfer.create({
      data: {
        fromWarehouseId: dto.fromWarehouseId,
        toWarehouseId: dto.toWarehouseId,
        transferNumber,
        status: 'completed',
        completedAt: new Date(),
      },
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
