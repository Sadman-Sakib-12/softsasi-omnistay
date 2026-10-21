export const INVENTORY_REPOSITORY_TOKEN = Symbol('IInventoryRepository');

export interface IInventoryRepository {
  // Warehouses & Stock
  createWarehouse(data: any): Promise<any>;
  findWarehouses(tenantId: string): Promise<any[]>;
  findWarehouseById(id: string): Promise<any | null>;
  createBin(data: any): Promise<any>;
  findWarehouseProduct(warehouseId: string, productId: string): Promise<any | null>;
  upsertWarehouseProduct(warehouseId: string, productId: string, stockQty: number): Promise<any>;
  createStockLog(data: any): Promise<any>;
  createWarehouseTransfer(data: any): Promise<any>;

  // Products & Recipes
  findProductBySku(tenantId: string, sku: string): Promise<any | null>;
  createProduct(data: any): Promise<any>;
  createProductBarcode(data: any): Promise<any>;
  createProductRecipe(data: any): Promise<any>;
  createProductRecipeItem(data: any): Promise<any>;
  findProducts(tenantId: string): Promise<any[]>;
  findProductById(id: string): Promise<any | null>;

  // Procurement (PO & GRN)
  createPurchase(data: any): Promise<any>;
  findPurchases(tenantId: string): Promise<any[]>;
  findPurchaseById(id: string): Promise<any | null>;
  createGoodsReceivedNote(data: any): Promise<any>;
  updatePurchase(id: string, data: Record<string, any>): Promise<any>;
  findGoodsReceivedNoteById(id: string): Promise<any | null>;

  // Valuation & Audit
  findWarehouseProductsForValuation(warehouseId: string): Promise<any[]>;
  createWastageLog(data: any): Promise<any>;
  findLowStockWarehouseProducts(tenantId: string, threshold?: number): Promise<any[]>;
  createReorderAlert(data: any): Promise<any>;
  createInventoryAdjustment(data: any): Promise<any>;
}
