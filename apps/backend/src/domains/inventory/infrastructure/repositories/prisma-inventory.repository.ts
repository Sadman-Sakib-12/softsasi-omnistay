import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IInventoryRepository } from '../../domain/repositories/inventory.repository.interface.js';

@Injectable()
export class PrismaInventoryRepository implements IInventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Warehouses & Stock
  async createWarehouse(data: any): Promise<any> {
    return this.prisma.warehouse.create({
      data,
      include: { bins: true, products: true },
    });
  }

  async findWarehouses(tenantId: string): Promise<any[]> {
    return this.prisma.warehouse.findMany({
      where: { tenantId },
      include: {
        bins: true,
        products: { include: { product: true } },
      },
    });
  }

  async findWarehouseById(id: string): Promise<any | null> {
    return this.prisma.warehouse.findUnique({
      where: { id },
      include: { bins: true, products: { include: { product: true } } },
    });
  }

  async createBin(data: any): Promise<any> {
    return this.prisma.warehouseBin.create({ data });
  }

  async findWarehouseProduct(warehouseId: string, productId: string): Promise<any | null> {
    return this.prisma.warehouseProduct.findUnique({
      where: { warehouseId_productId: { warehouseId, productId } },
      include: { product: true, warehouse: true },
    });
  }

  async upsertWarehouseProduct(
    warehouseId: string,
    productId: string,
    stockQty: number,
  ): Promise<any> {
    return this.prisma.warehouseProduct.upsert({
      where: { warehouseId_productId: { warehouseId, productId } },
      update: { stockQty },
      create: {
        warehouseId,
        productId,
        stockQty: Math.max(0, stockQty),
        reorderLevel: 10,
      },
    });
  }

  async createStockLog(data: any): Promise<any> {
    return this.prisma.inventoryStockLog.create({ data });
  }

  async createWarehouseTransfer(data: any): Promise<any> {
    return this.prisma.warehouseTransfer.create({ data });
  }

  // Products & Recipes
  async findProductBySku(tenantId: string, sku: string): Promise<any | null> {
    return this.prisma.product.findFirst({
      where: { tenantId, sku },
    });
  }

  async createProduct(data: any): Promise<any> {
    return this.prisma.product.create({ data });
  }

  async createProductBarcode(data: any): Promise<any> {
    return this.prisma.productBarcode.create({ data });
  }

  async createProductRecipe(data: any): Promise<any> {
    return this.prisma.productRecipe.create({ data });
  }

  async createProductRecipeItem(data: any): Promise<any> {
    return this.prisma.productRecipeItem.create({ data });
  }

  async findProducts(tenantId: string): Promise<any[]> {
    return this.prisma.product.findMany({
      where: { tenantId },
      include: {
        category: true,
        unit: true,
        barcodes: true,
        recipeItems: { include: { product: true } },
        warehouseProducts: { include: { warehouse: true } },
      },
    });
  }

  async findProductById(id: string): Promise<any | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true,
        barcodes: true,
        recipeItems: { include: { product: true } },
        warehouseProducts: { include: { warehouse: true } },
      },
    });
  }

  // Procurement (PO & GRN)
  async createPurchase(data: any): Promise<any> {
    return this.prisma.purchase.create({
      data,
      include: {
        products: { include: { product: true } },
      },
    });
  }

  async findPurchases(tenantId: string): Promise<any[]> {
    return this.prisma.purchase.findMany({
      where: { tenantId },
      include: {
        products: { include: { product: true } },
        grns: { include: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPurchaseById(id: string): Promise<any | null> {
    return this.prisma.purchase.findUnique({
      where: { id },
      include: {
        products: { include: { product: true } },
        grns: { include: { items: true } },
      },
    });
  }

  async createGoodsReceivedNote(data: any): Promise<any> {
    return this.prisma.goodsReceivedNote.create({
      data,
      include: { items: true },
    });
  }

  async updatePurchase(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.purchase.update({ where: { id }, data });
  }

  async findGoodsReceivedNoteById(id: string): Promise<any | null> {
    return this.prisma.goodsReceivedNote.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  // Valuation & Audit
  async findWarehouseProductsForValuation(warehouseId: string): Promise<any[]> {
    return this.prisma.warehouseProduct.findMany({
      where: { warehouseId },
      include: { product: true, warehouse: true },
    });
  }

  async createWastageLog(data: any): Promise<any> {
    return this.prisma.inventoryWastageLog.create({ data });
  }

  async findLowStockWarehouseProducts(tenantId: string, threshold = 10): Promise<any[]> {
    return this.prisma.warehouseProduct.findMany({
      where: {
        warehouse: { tenantId },
        stockQty: { lte: threshold },
      },
      include: {
        product: true,
        warehouse: true,
      },
    });
  }

  async createReorderAlert(data: any): Promise<any> {
    return this.prisma.reorderThresholdAlert.create({ data });
  }

  async createInventoryAdjustment(data: any): Promise<any> {
    return this.prisma.inventoryAdjustment.create({
      data,
      include: { items: true },
    });
  }
}
