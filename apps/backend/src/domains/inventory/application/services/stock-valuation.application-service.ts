import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  INVENTORY_REPOSITORY_TOKEN,
  type IInventoryRepository,
} from '../../domain/repositories/inventory.repository.interface.js';
import { calculateInventoryValuation } from '../../domain/rules/inventory.rule.js';
import type {
  PhysicalStocktakeAdjustmentDto,
  RecordWastageDto,
} from '../../presentation/dto/stock-audit.dto.js';
import { WarehouseApplicationService } from './warehouse.application-service.js';

@Injectable()
export class StockValuationApplicationService {
  constructor(
    @Inject(INVENTORY_REPOSITORY_TOKEN)
    private readonly repo: IInventoryRepository,
    private readonly warehouseService: WarehouseApplicationService,
  ) {}

  async calculateInventoryValuation(warehouseId: string, method: 'FIFO' | 'WAC' = 'FIFO') {
    const products = await this.repo.findWarehouseProductsForValuation(warehouseId);

    const items = products.map((wp: any) => ({
      productId: wp.productId,
      name: wp.product.name,
      sku: wp.product.sku,
      stockQty: Number(wp.stockQty),
      unitCost: Number(wp.product.costPrice),
    }));

    const valuationResult = calculateInventoryValuation(items, method);

    return {
      warehouseId,
      valuationMethod: method,
      calculatedAt: new Date(),
      totalItemCount: valuationResult.totalItemCount,
      totalInventoryAssetValue: valuationResult.totalInventoryAssetValue,
      inventoryItems: valuationResult.items,
    };
  }

  async consumeRecipeIngredientsForOrder(
    warehouseId: string,
    recipeItems: { productId: string; quantity: number }[],
    orderReference: string,
  ) {
    const deductions = [];

    for (const item of recipeItems) {
      const product = await this.repo.findProductById(item.productId);

      if (product && product.isRecipe && product.recipeItems && product.recipeItems.length > 0) {
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
    const product = await this.repo.findProductById(dto.productId);
    if (!product) throw new NotFoundException('Product not found');

    const costLost = dto.costLost || Number(dto.quantity) * Number(product.costPrice);

    await this.warehouseService.updateStock(
      warehouseId,
      dto.productId,
      -dto.quantity,
      'spoilage_wastage',
      dto.reason,
    );

    const wastage = await this.repo.createWastageLog({
      productId: dto.productId,
      quantity: dto.quantity,
      reason: dto.reason,
      costLost,
      reportedBy,
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
    const lowStockItems = await this.repo.findLowStockWarehouseProducts(tenantId, 10);

    const alerts = [];
    for (const item of lowStockItems) {
      const alert = await this.repo.createReorderAlert({
        productId: item.productId,
        currentQty: item.stockQty,
        threshold: item.reorderLevel,
        isResolved: false,
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

    const adjustment = await this.repo.createInventoryAdjustment({
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
    });

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
