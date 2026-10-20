import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WarehouseService } from './warehouse.service.js';
import { ProductCatalogService } from './product-catalog.service.js';
import { ProcurementService } from './procurement.service.js';
import { StockValuationService } from './stock-valuation.service.js';

describe('Phase 5 — Multi-Warehouse Supply Chain & Inventory Suite', () => {
  let mockPrisma: any;
  let warehouseService: WarehouseService;
  let catalogService: ProductCatalogService;
  let procurementService: ProcurementService;
  let valuationService: StockValuationService;

  beforeEach(() => {
    mockPrisma = {
      warehouse: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'wh-1', ...data })),
        findMany: vi.fn().mockResolvedValue([{ id: 'wh-1', name: 'Central Depot' }]),
        findUnique: vi.fn().mockResolvedValue({ id: 'wh-1', name: 'Central Depot' }),
      },
      warehouseBin: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'bin-1', ...data })),
      },
      warehouseProduct: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.warehouseId_productId?.warehouseId === 'wh-1') {
            return Promise.resolve({
              warehouseId: 'wh-1',
              productId: 'prod-wine-1',
              stockQty: 100.0,
              reorderLevel: 20.0,
              product: { name: 'Chateau Red Wine 2020', costPrice: 45.0, sku: 'WINE-001' },
            });
          }
          return Promise.resolve(null);
        }),
        upsert: vi.fn().mockImplementation(({ update, create }) =>
          Promise.resolve({ id: 'wp-1', stockQty: update?.stockQty || create?.stockQty }),
        ),
        findMany: vi.fn().mockResolvedValue([
          {
            warehouseId: 'wh-1',
            productId: 'prod-wine-1',
            stockQty: 100.0,
            reorderLevel: 20.0,
            product: { name: 'Chateau Red Wine', costPrice: 45.0, sku: 'WINE-001' },
          },
        ]),
      },
      inventoryStockLog: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'log-1', ...data })),
      },
      warehouseTransfer: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'trf-1', ...data })),
      },
      product: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'prod-beef-1', ...data })),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === 'prod-steak-menu') {
            return Promise.resolve({
              id: 'prod-steak-menu',
              name: 'Wagyu Steak Dinner',
              isRecipe: true,
              recipeItems: [
                { productId: 'prod-beef-raw', quantity: 0.3 }, // 300g raw beef
                { productId: 'prod-butter-raw', quantity: 0.05 }, // 50g butter
              ],
            });
          }
          return Promise.resolve({
            id: where.id,
            name: 'Wagyu Beef',
            costPrice: 50.0,
            sku: 'ING-BEEF',
            isRecipe: false,
          });
        }),
        findMany: vi.fn().mockResolvedValue([]),
      },
      productBarcode: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'bc-1', ...data })),
      },
      productRecipe: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'rec-1', ...data })),
      },
      productRecipeItem: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'reci-1', ...data })),
      },
      purchase: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({
          id: 'po-101',
          poNumber: data.poNumber,
          totalCost: data.totalCost,
          status: 'approved',
          products: data.products?.create || [],
        })),
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue({
          id: 'po-101',
          poNumber: 'PO-999001',
          totalCost: 1000.0,
          products: [
            { productId: 'prod-1', quantity: 100, unitCost: 10.0 },
          ],
        }),
        update: vi.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data })),
      },
      goodsReceivedNote: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({
          id: 'grn-501',
          grnNumber: data.grnNumber,
          status: 'accepted',
          items: data.items?.create || [],
        })),
        findUnique: vi.fn().mockResolvedValue({
          id: 'grn-501',
          grnNumber: 'GRN-999001',
          items: [
            { itemTitle: 'Whole Milk', qtyOrdered: 100, qtyReceived: 100, isDamaged: false },
          ],
        }),
      },
      inventoryWastageLog: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'wst-1', ...data })),
      },
      reorderThresholdAlert: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'alt-1', ...data })),
      },
      inventoryAdjustment: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'adj-1', ...data })),
      },
    };

    warehouseService = new WarehouseService(mockPrisma);
    catalogService = new ProductCatalogService(mockPrisma);
    procurementService = new ProcurementService(mockPrisma, warehouseService);
    valuationService = new StockValuationService(mockPrisma, warehouseService);
  });

  describe('Multi-Warehouse & Internal Transfers', () => {
    it('should create a warehouse and storage bin', async () => {
      const wh = await warehouseService.createWarehouse('t-1', {
        name: 'Wine Cellar & Beverage Depot',
        code: 'WH-CELLAR-01',
      });
      expect(wh.name).toBe('Wine Cellar & Beverage Depot');
      expect(wh.code).toBe('WH-CELLAR-01');

      const bin = await warehouseService.createBin(wh.id, {
        binCode: 'BIN-WINE-A4',
        zone: 'Rooftop Bar Reserve',
      });
      expect(bin.binCode).toBe('BIN-WINE-A4');
    });

    it('should execute internal stock transfer between warehouses with validation', async () => {
      const res = await warehouseService.initiateStockTransfer({
        fromWarehouseId: 'wh-1',
        toWarehouseId: 'wh-bar',
        productId: 'prod-wine-1',
        quantity: 50.0,
      });

      expect(res.quantity).toBe(50.0);
      expect(res.status).toBe('completed');
      expect(mockPrisma.warehouseTransfer.create).toHaveBeenCalled();
    });

    it('should reject internal transfer if source warehouse lacks sufficient stock', async () => {
      await expect(
        warehouseService.initiateStockTransfer({
          fromWarehouseId: 'wh-1',
          toWarehouseId: 'wh-bar',
          productId: 'prod-wine-1',
          quantity: 250.0, // Exceeds 100 available
        }),
      ).rejects.toThrow('Cannot transfer 250');
    });
  });

  describe('Product Master & Recipe BOMs', () => {
    it('should create product with auto-generated EAN-13 barcode', async () => {
      const barcode = catalogService.generateBarcode('ING-WAGYU-8899');
      expect(barcode).toHaveLength(13);
      expect(/^\d{13}$/.test(barcode)).toBe(true);

      const prod = await catalogService.createProduct('t-1', {
        name: 'Wagyu Beef Ribeye',
        sku: 'ING-WAGYU-8899',
        costPrice: 42.0,
      });
      expect(prod).toBeDefined();
    });
  });

  describe('Procurement & 3-Way Invoice Matching', () => {
    it('should create purchase order and receive goods with GRN', async () => {
      const po = await procurementService.createPurchaseOrder('t-1', {
        items: [{ productId: 'prod-1', quantity: 100, unitCost: 10.0 }],
      });
      expect(po.totalCost).toBe(1000.0);
      expect(po.status).toBe('approved');

      const grn = await procurementService.receiveGoods({
        purchaseId: po.id,
        items: [{ itemTitle: 'Whole Milk', qtyOrdered: 100, qtyReceived: 100, isDamaged: false }],
      });
      expect(grn.status).toBe('accepted');
    });

    it('should approve 3-way match when PO, GRN, and vendor bill match within 1% tolerance', async () => {
      const match = await procurementService.executeThreeWayMatch({
        purchaseId: 'po-101',
        grnId: 'grn-501',
        billedAmount: 1000.0,
      });

      expect(match.matchStatus).toBe('MATCHED');
      expect(match.variance).toBe(0);
      expect(match.recommendation).toContain('Approve vendor payment release');
    });

    it('should flag discrepancy when billed amount deviates significantly from received goods', async () => {
      const match = await procurementService.executeThreeWayMatch({
        purchaseId: 'po-101',
        grnId: 'grn-501',
        billedAmount: 1350.0, // Billed 350 over GRN value
      });

      expect(match.matchStatus).toBe('DISCREPANCY_FLAGGED');
      expect(match.variance).toBe(350.0);
      expect(match.recommendation).toContain('Hold payment and issue Debit Note');
    });
  });

  describe('Stock Valuation, Recipe Consumption & Spoilage Write-Off', () => {
    it('should compute total inventory asset valuation using FIFO', async () => {
      const valuation = await valuationService.calculateInventoryValuation('wh-1', 'FIFO');
      expect(valuation.valuationMethod).toBe('FIFO');
      expect(valuation.totalInventoryAssetValue).toBe(4500.0); // 100 * 45
    });

    it('should deduct raw recipe ingredients when menu items are ordered', async () => {
      const res = await valuationService.consumeRecipeIngredientsForOrder(
        'wh-1',
        [{ productId: 'prod-steak-menu', quantity: 2 }],
        'POS-ORDER-1234',
      );

      expect(res.success).toBe(true);
      expect(res.deductions).toHaveLength(2);
      expect(res.deductions[0].deductedQty).toBe(0.6); // 2 * 0.3kg beef
      expect(res.deductions[1].deductedQty).toBe(0.1); // 2 * 0.05kg butter
    });

    it('should write off expired food spoilage and post to OPEX 6200', async () => {
      const writeOff = await valuationService.recordWastage('wh-1', {
        productId: 'prod-wine-1',
        quantity: 2.0,
        reason: 'Broken bottle during bar stocking',
      });

      expect(writeOff.postedToExpenseAccount).toContain('6200');
      expect(writeOff.costLost).toBe(100.0); // 2 * $50
    });

    it('should reconcile physical stocktake audit and adjust book count', async () => {
      const audit = await valuationService.reconcilePhysicalStocktake('t-1', {
        warehouseId: 'wh-1',
        productId: 'prod-wine-1',
        physicalCount: 95.0, // 5 bottles missing
      });

      expect(audit.variance).toBe(-5.0);
      expect(audit.reconciliationStatus).toBe('DEFICIT');
      expect(audit.adjustedStockLevel).toBe(95.0);
    });
  });
});
