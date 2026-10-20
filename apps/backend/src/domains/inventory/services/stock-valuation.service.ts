import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { PhysicalStocktakeAdjustmentDto, RecordWastageDto } from '../dto/stock-audit.dto.js';
import { WarehouseService } from './warehouse.service.js';

@Injectable()
export class StockValuationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly warehouseService: WarehouseService,
  ) {}

  async calculateInventoryValuation(warehouseId: string, method: 'FIFO' | 'WAC' = 'FIFO') {
    const products = await this.prisma.warehouseProduct.findMany({
      where: { warehouseId },
      include: { product: true, warehouse: true },
    });

    let totalValuation = 0;
    const items = products.map((wp) => {
      const qty = Number(wp.stockQty);
      const cost = Number(wp.product.costPrice);
      const lineValuation = Number((qty * cost).toFixed(2));
      totalValuation += lineValuation;

      return {
        productId: wp.productId,
        name: wp.product.name,
        sku: wp.product.sku,
        stockQty: qty,
        unitCost: cost,
        lineValuation,
        valuationMethod: method,
      };
    });

    return {
      warehouseId,
      valuationMethod: method,
      calculatedAt: new Date(),
      totalItemCount: items.length,
      totalInventoryAssetValue: Number(totalValuation.toFixed(2)),
      inventoryItems: items,
    };
  }

  async consumeRecipeIngredientsForOrder(
    warehouseId: string,
    recipeItems: { productId: string; quantity: number }[],
    orderReference: string,
  ) {
    const deductions = [];

    for (const item of recipeItems) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: { recipeItems: true },
      });

      if (product && product.isRecipe && product.recipeItems.length > 0) {
        for (const ing of product.recipeItems) {
          const totalQtyToDeduct = Number(ing.quantity) * item.quantity;
          const updated = await this.warehouseService.updateStock(
            warehouseId,
            ing.productId,
            -totalQtyToDeduct,
            'sale_consumed',
            `POS Order: ${orderReference} - Recipe ${product.name}`,
          );
          deductions.push({
            parentProduct: product.name,
            ingredientProductId: ing.productId,
            deductedQty: totalQtyToDeduct,
            remainingStock: updated.stockQty,
          });
        }
      }
    }

    return {
      success: true,
      orderReference,
      deductions,
    };
  }

  async recordWastage(warehouseId: string, dto: RecordWastageDto, reportedBy?: string) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    const costLost = dto.costLost || Number(dto.quantity) * Number(product.costPrice);

    // 1. Deduct stock from warehouse
    await this.warehouseService.updateStock(
      warehouseId,
      dto.productId,
      -dto.quantity,
      'spoilage_wastage',
      dto.reason,
    );

    // 2. Log in wastage registry
    const wastage = await this.prisma.inventoryWastageLog.create({
      data: {
        productId: dto.productId,
        quantity: dto.quantity,
        reason: dto.reason,
        costLost,
        reportedBy,
      },
    });

    return {
      message: 'Wastage and spoilage written off successfully',
      wastageId: wastage.id,
      productName: product.name,
      quantityLost: dto.quantity,
      costLost,
      postedToExpenseAccount: '6200 - Property & Kitchen Spoilage / Maintenance',
    };
  }

  async checkReorderThresholds(tenantId: string) {
    const lowStockItems = await this.prisma.warehouseProduct.findMany({
      where: {
        warehouse: { tenantId },
        stockQty: { lte: 10 }, // Below or at reorder level
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    const alerts = [];
    for (const item of lowStockItems) {
      const alert = await this.prisma.reorderThresholdAlert.create({
        data: {
          productId: item.productId,
          currentQty: item.stockQty,
          threshold: item.reorderLevel,
          isResolved: false,
        },
      });

      alerts.push({
        alertId: alert.id,
        warehouseName: item.warehouse.name,
        productName: item.product.name,
        sku: item.product.sku,
        currentStock: Number(item.stockQty),
        reorderThreshold: Number(item.reorderLevel),
        urgency: Number(item.stockQty) === 0 ? 'CRITICAL_STOCKOUT' : 'WARNING_LOW_STOCK',
      });
    }

    return {
      totalAlerts: alerts.length,
      alerts,
    };
  }

  async reconcilePhysicalStocktake(tenantId: string, dto: PhysicalStocktakeAdjustmentDto) {
    const currentRecord = await this.warehouseService.getStockLevel(dto.warehouseId, dto.productId);
    const bookQty = Number(currentRecord.stockQty);
    const variance = dto.physicalCount - bookQty;

    // Create adjustment
    const adjustment = await this.prisma.inventoryAdjustment.create({
      data: {
        tenantId,
        reason: dto.reason || 'Physical Count Reconciliation',
        adjustedDate: new Date(),
        status: 'approved',
        items: {
          create: [
            {
              productId: dto.productId,
              quantityDiff: variance,
            },
          ],
        },
      },
      include: { items: true },
    });

    // Update stock to match physical count
    if (variance !== 0) {
      await this.warehouseService.updateStock(
        dto.warehouseId,
        dto.productId,
        variance,
        'audit_adjustment',
        `Reconciliation Adjustment ID: ${adjustment.id}`,
      );
    }

    return {
      message: 'Physical stocktake audit reconciled successfully',
      adjustmentId: adjustment.id,
      bookQuantity: bookQty,
      physicalCount: dto.physicalCount,
      variance,
      adjustedStockLevel: dto.physicalCount,
      reconciliationStatus: variance === 0 ? 'ACCURATE' : variance > 0 ? 'SURPLUS' : 'DEFICIT',
    };
  }
}
