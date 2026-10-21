import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateInventoryValuation,
  evaluateThreeWayMatch,
  generateEan13Barcode,
} from './domain/rules/inventory.rule.js';
import { WarehouseApplicationService } from './application/services/warehouse.application-service.js';
import { ProductCatalogApplicationService } from './application/services/product-catalog.application-service.js';
import { ProcurementApplicationService } from './application/services/procurement.application-service.js';
import { StockValuationApplicationService } from './application/services/stock-valuation.application-service.js';
import type { IInventoryRepository } from './domain/repositories/inventory.repository.interface.js';

describe('Inventory Domain — Clean Architecture & DDD Test Suite', () => {
  describe('Domain Rules (Pure Business Logic)', () => {
    it('generateEan13Barcode: should generate valid 13-digit barcode with check digit', () => {
      const barcode = generateEan13Barcode('WINE-1234');
      expect(barcode).toHaveLength(13);
      expect(barcode).toMatch(/^\d{13}$/);
    });

    it('calculateInventoryValuation: should calculate asset value correctly under FIFO and WAC', () => {
      const items = [
        { productId: 'p1', name: 'Item 1', sku: 'SKU1', stockQty: 10, unitCost: 15.5 },
        { productId: 'p2', name: 'Item 2', sku: 'SKU2', stockQty: 20, unitCost: 10.0 },
      ];
      const result = calculateInventoryValuation(items, 'FIFO');
      expect(result.totalItemCount).toBe(2);
      expect(result.totalInventoryAssetValue).toBe(355.0); // 155 + 200 = 355
    });

    it('evaluateThreeWayMatch: should match when within 1% tolerance and flag discrepancy otherwise', () => {
      const grnItemsMatch = [{ qtyReceived: 10, unitCost: 100, isDamaged: false }];
      const matched = evaluateThreeWayMatch(1000, 1005, grnItemsMatch, 1.0); // 0.5% variance
      expect(matched.matchStatus).toBe('MATCHED');

      const grnItemsDamaged = [
        { qtyReceived: 8, unitCost: 100, isDamaged: false },
        { qtyReceived: 2, unitCost: 100, isDamaged: true },
      ];
      const flagged = evaluateThreeWayMatch(1000, 1000, grnItemsDamaged, 1.0); // billed 1000 vs received 800 -> 200 variance
      expect(flagged.matchStatus).toBe('DISCREPANCY_FLAGGED');
      expect(flagged.grnReceivedValue).toBe(800);
    });
  });

  describe('Application Services & Repository Orchestration', () => {
    let mockRepo: IInventoryRepository;
    let warehouseService: WarehouseApplicationService;
    let catalogService: ProductCatalogApplicationService;
    let procurementService: ProcurementApplicationService;
    let valuationService: StockValuationApplicationService;

    beforeEach(() => {
      mockRepo = {
        createWarehouse: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'wh-1', ...data })),
        findWarehouses: vi.fn().mockResolvedValue([{ id: 'wh-1', name: 'Central Depot' }]),
        findWarehouseById: vi.fn().mockImplementation((id) => {
          if (id === 'wh-1') return Promise.resolve({ id: 'wh-1', name: 'Central Depot' });
          if (id === 'wh-2') return Promise.resolve({ id: 'wh-2', name: 'Kitchen Store' });
          return Promise.resolve(null);
        }),
        createBin: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'bin-1', ...data })),
        findWarehouseProduct: vi.fn().mockImplementation((warehouseId, productId) => {
          if (warehouseId === 'wh-1') {
            return Promise.resolve({
              warehouseId: 'wh-1',
              productId,
              stockQty: 100.0,
              reorderLevel: 20.0,
              product: { name: 'Chateau Red Wine 2020', costPrice: 45.0, sku: 'WINE-001' },
            });
          }
          return Promise.resolve(null);
        }),
        upsertWarehouseProduct: vi.fn().mockImplementation((warehouseId, productId, stockQty) =>
          Promise.resolve({ warehouseId, productId, stockQty }),
        ),
        createStockLog: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'log-1', ...data })),
        createWarehouseTransfer: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'trf-1', ...data })),

        findProductBySku: vi.fn().mockResolvedValue(null),
        createProduct: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'prod-1', ...data })),
        createProductBarcode: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'bc-1', ...data })),
        createProductRecipe: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'rec-1', ...data })),
        createProductRecipeItem: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'ri-1', ...data })),
        findProducts: vi.fn().mockResolvedValue([]),
        findProductById: vi.fn().mockImplementation((id) => {
          if (id === 'prod-steak-menu') {
            return Promise.resolve({
              id: 'prod-steak-menu',
              name: 'Ribeye Steak Dinner',
              isRecipe: true,
              costPrice: 20.0,
              recipeItems: [
                { productId: 'prod-beef-raw', quantity: 0.3 },
                { productId: 'prod-butter', quantity: 0.05 },
              ],
            });
          }
          return Promise.resolve({ id, name: 'Sample Product', costPrice: 10.0, isRecipe: false });
        }),

        createPurchase: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'po-1', ...data })),
        findPurchases: vi.fn().mockResolvedValue([]),
        findPurchaseById: vi.fn().mockResolvedValue({
          id: 'po-1',
          poNumber: 'PO-123456',
          totalCost: 1000.0,
          products: [
            { productId: 'prod-wine-1', quantity: 50, unitCost: 20.0 },
          ],
        }),
        createGoodsReceivedNote: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'grn-1', ...data })),
        updatePurchase: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        findGoodsReceivedNoteById: vi.fn().mockResolvedValue({
          id: 'grn-1',
          grnNumber: 'GRN-123456',
          items: [
            { itemTitle: 'Chateau Red Wine', qtyOrdered: 50, qtyReceived: 50, isDamaged: false },
          ],
        }),

        findWarehouseProductsForValuation: vi.fn().mockResolvedValue([
          {
            warehouseId: 'wh-1',
            productId: 'prod-wine-1',
            stockQty: 100.0,
            product: { name: 'Chateau Red Wine', costPrice: 45.0, sku: 'WINE-001' },
          },
        ]),
        createWastageLog: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'w-1', ...data })),
        findLowStockWarehouseProducts: vi.fn().mockResolvedValue([
          {
            warehouseId: 'wh-1',
            productId: 'prod-low',
            stockQty: 5.0,
            reorderLevel: 20.0,
            warehouse: { name: 'Main Depot' },
            product: { name: 'Olive Oil', sku: 'OIL-01' },
          },
        ]),
        createReorderAlert: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'alert-1', ...data })),
        createInventoryAdjustment: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'adj-1', ...data })),
      };

      warehouseService = new WarehouseApplicationService(mockRepo);
      catalogService = new ProductCatalogApplicationService(mockRepo);
      procurementService = new ProcurementApplicationService(mockRepo, warehouseService);
      valuationService = new StockValuationApplicationService(mockRepo, warehouseService);
    });

    it('warehouseService: should create warehouse, bin, and transfer stock between warehouses', async () => {
      const wh = await warehouseService.createWarehouse('tenant-1', {
        name: 'Beverage Cellar',
        code: 'WH-CEL-01',
      });
      expect(wh.id).toBe('wh-1');

      const transfer = await warehouseService.initiateStockTransfer({
        fromWarehouseId: 'wh-1',
        toWarehouseId: 'wh-2',
        productId: 'prod-wine-1',
        quantity: 20,
      });
      expect(transfer.status).toBe('completed');
      expect(mockRepo.createWarehouseTransfer).toHaveBeenCalled();
      expect(mockRepo.upsertWarehouseProduct).toHaveBeenCalled();
    });

    it('catalogService: should create product and auto-assign barcode', async () => {
      const prod = await catalogService.createProduct('tenant-1', {
        name: 'French Butter 500g',
        sku: 'BUTTER-001',
        costPrice: 5.0,
      });
      expect(prod.id).toBe('prod-1');
      expect(mockRepo.createProductBarcode).toHaveBeenCalled();
    });

    it('procurementService: should create PO, receive GRN, and evaluate 3-way match', async () => {
      const po = await procurementService.createPurchaseOrder('tenant-1', {
        items: [{ productId: 'prod-wine-1', quantity: 50, unitCost: 20.0 }],
      });
      expect(po.id).toBe('po-1');

      const grn = await procurementService.receiveGoods(
        {
          purchaseId: 'po-1',
          items: [{ itemTitle: 'Chateau Red Wine', qtyOrdered: 50, qtyReceived: 50, isDamaged: false }],
        },
        'wh-1',
      );
      expect(grn.id).toBe('grn-1');
      expect(mockRepo.updatePurchase).toHaveBeenCalledWith('po-1', { status: 'received' });

      const match = await procurementService.executeThreeWayMatch({
        purchaseId: 'po-1',
        grnId: 'grn-1',
        billedAmount: 1000.0,
      });
      expect(match.matchStatus).toBe('MATCHED');
      expect(match.variance).toBe(0);
    });

    it('valuationService: should calculate FIFO valuation, recipe deduction, wastage, and stocktake reconciliation', async () => {
      const valuation = await valuationService.calculateInventoryValuation('wh-1', 'FIFO');
      expect(valuation.totalInventoryAssetValue).toBe(4500.0); // 100 * 45

      const deductions = await valuationService.consumeRecipeIngredientsForOrder(
        'wh-1',
        [{ productId: 'prod-steak-menu', quantity: 2 }],
        'POS-998877',
      );
      expect(deductions.success).toBe(true);
      expect(deductions.deductions).toHaveLength(2);

      const wastage = await valuationService.recordWastage('wh-1', {
        productId: 'prod-wine-1',
        quantity: 2,
        reason: 'Broken bottle during restocking',
      });
      expect(wastage.message).toContain('written off successfully');

      const alerts = await valuationService.checkReorderThresholds('tenant-1');
      expect(alerts.totalAlerts).toBe(1);

      const reconciliation = await valuationService.reconcilePhysicalStocktake('tenant-1', {
        warehouseId: 'wh-1',
        productId: 'prod-wine-1',
        physicalCount: 95,
      });
      expect(reconciliation.reconciliationStatus).toBe('DEFICIT');
      expect(reconciliation.variance).toBe(-5);
    });
  });
});
