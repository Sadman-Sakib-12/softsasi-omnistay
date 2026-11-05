import { api } from '@/lib/api/client';

export interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  category?: { id: string; name: string; slug: string } | null;
  categoryName?: string;
  barcode?: string;
  costPrice: number;
  retailPrice: number;
  isRecipe?: boolean;
  currentStock: number;
  reorderLevel: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  warehouseProducts?: Array<{
    id: string;
    warehouseId: string;
    stockQty: number;
    reorderLevel: number;
    warehouse?: { id: string; name: string; code: string };
  }>;
}

export interface WarehouseItem {
  id: string;
  name: string;
  code: string;
  address?: string;
  isActive: boolean;
  totalStockCount?: number;
  bins?: Array<{ id: string; binCode: string; zone?: string }>;
  products?: Array<{
    id: string;
    productId: string;
    stockQty: number;
    reorderLevel: number;
    product?: { id: string; name: string; sku: string; costPrice: number };
  }>;
}

export interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  vendorId?: string;
  vendorName?: string;
  totalCost: number;
  status: string;
  createdAt: string;
  products?: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    product?: { id: string; name: string; sku: string };
  }>;
  grns?: Array<{
    id: string;
    grnNumber: string;
    receivedDate: string;
    status: string;
    items?: Array<{
      id: string;
      itemTitle: string;
      qtyOrdered: number;
      qtyReceived: number;
      isDamaged: boolean;
    }>;
  }>;
}

export interface ThreeWayMatchResult {
  matchStatus: 'EXACT_MATCH' | 'PRICE_VARIANCE' | 'SHORT_DELIVERY' | 'REJECTED';
  poNumber: string;
  grnNumber: string;
  vendorInvoiceNumber: string;
  poAmount: number;
  grnReceivedValue: number;
  billedAmount: number;
  variance: number;
  variancePercent: number;
  recommendation: string;
}

export interface InventoryValuationResult {
  warehouseId: string;
  valuationMethod: 'FIFO' | 'WAC';
  calculatedAt: string;
  totalItemCount: number;
  totalInventoryAssetValue: number;
  inventoryItems: Array<{
    productId: string;
    name: string;
    sku: string;
    stockQty: number;
    unitCost: number;
    totalValue: number;
  }>;
}

export interface ReorderAlert {
  alertId: string;
  warehouseName: string;
  productName: string;
  sku: string;
  currentStock: number;
  reorderThreshold: number;
  urgency: 'CRITICAL_STOCKOUT' | 'WARNING_LOW_STOCK';
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  barcode?: string;
  costPrice: number;
  retailPrice?: number;
  isRecipe?: boolean;
}

export interface CreateWarehousePayload {
  name: string;
  code: string;
  address?: string;
  isActive?: boolean;
}

export interface InitiateStockTransferPayload {
  fromWarehouseId: string;
  toWarehouseId: string;
  productId: string;
  quantity: number;
  reason?: string;
}

export interface CreatePurchaseOrderPayload {
  vendorId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
  }>;
}

export interface CreateGoodsReceivedNotePayload {
  purchaseId: string;
  items: Array<{
    itemTitle: string;
    qtyOrdered: number;
    qtyReceived: number;
    isDamaged?: boolean;
  }>;
}

export interface ThreeWayMatchPayload {
  purchaseId: string;
  grnId: string;
  billedAmount: number;
  vendorInvoiceNumber?: string;
}

export interface RecordWastagePayload {
  productId: string;
  quantity: number;
  reason: string;
  costLost?: number;
}

export interface PhysicalStocktakeAdjustmentPayload {
  warehouseId: string;
  productId: string;
  physicalCount: number;
  reason?: string;
}

export const inventoryService = {
  // 8.1 Product Master Catalog
  getProducts: async (): Promise<InventoryProduct[]> => {
    try {
      const res = await api.get<any>('/api/v1/inventory/products');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((item: any) => {
        let totalStock = 0;
        if (Array.isArray(item.warehouseProducts)) {
          totalStock = item.warehouseProducts.reduce((sum: number, wp: any) => sum + Number(wp.stockQty || 0), 0);
        } else {
          totalStock = Number(item.currentStock ?? item.stock ?? item.quantity ?? 0);
        }
        const reorderLevel = Number(item.reorderLevel || item.reorderPoint || 10);
        return {
          id: item.id,
          sku: item.sku || '',
          name: item.name || '',
          category: item.category || null,
          categoryName: item.category?.name || 'Hospitality Supplies',
          barcode: item.barcode || item.barcodes?.[0]?.barcode || '5901234120015',
          costPrice: Number(item.costPrice || 0),
          retailPrice: Number(item.retailPrice || 0),
          isRecipe: Boolean(item.isRecipe),
          currentStock: totalStock,
          reorderLevel,
          status: totalStock === 0 ? 'OUT_OF_STOCK' : totalStock <= reorderLevel ? 'LOW_STOCK' : 'IN_STOCK',
          warehouseProducts: item.warehouseProducts || [],
        };
      });
    } catch {
      return [];
    }
  },

  createProduct: async (dto: CreateProductPayload): Promise<any> => {
    return await api.post('/api/v1/inventory/products', dto);
  },

  // 8.2 Multi-Warehouse Storage Locations
  getWarehouses: async (): Promise<WarehouseItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/inventory/warehouses');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((wh: any) => ({
        id: wh.id,
        name: wh.name,
        code: wh.code,
        address: wh.address || '',
        isActive: wh.isActive ?? true,
        bins: wh.bins || [],
        products: wh.products || [],
        totalStockCount: (wh.products || []).reduce((sum: number, p: any) => sum + Number(p.stockQty || 0), 0),
      }));
    } catch {
      return [];
    }
  },

  createWarehouse: async (dto: CreateWarehousePayload): Promise<any> => {
    return await api.post('/api/v1/inventory/warehouses', dto);
  },

  createBin: async (warehouseId: string, dto: { binCode: string; zone?: string }): Promise<any> => {
    return await api.post(`/api/v1/inventory/warehouses/${warehouseId}/bins`, dto);
  },

  initiateStockTransfer: async (dto: InitiateStockTransferPayload): Promise<any> => {
    return await api.post('/api/v1/inventory/warehouses/transfers', dto);
  },

  // 8.3 Procurement & GRN 3-Way Match
  getPurchaseOrders: async (): Promise<PurchaseOrderItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/inventory/procurement/orders');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((po: any) => ({
        id: po.id,
        poNumber: po.poNumber,
        vendorId: po.vendorId,
        vendorName: po.vendorId ? 'Verified Hotel Supplier' : 'Direct Vendor',
        totalCost: Number(po.totalCost || 0),
        status: po.status || 'draft',
        createdAt: po.createdAt,
        products: (po.products || []).map((p: any) => ({
          id: p.id,
          productId: p.productId,
          quantity: Number(p.quantity || 0),
          unitCost: Number(p.unitCost || 0),
          totalCost: Number(p.totalCost || 0),
          product: p.product ? { name: p.product.name, sku: p.product.sku } : undefined,
        })),
        grns: po.grns || [],
      }));
    } catch {
      return [];
    }
  },

  createPurchaseOrder: async (dto: CreatePurchaseOrderPayload): Promise<any> => {
    return await api.post('/api/v1/inventory/procurement/orders', dto);
  },

  receiveGoods: async (dto: CreateGoodsReceivedNotePayload, warehouseId?: string): Promise<any> => {
    const url = warehouseId
      ? `/api/v1/inventory/procurement/grn?warehouseId=${encodeURIComponent(warehouseId)}`
      : '/api/v1/inventory/procurement/grn';
    return await api.post(url, dto);
  },

  executeThreeWayMatch: async (dto: ThreeWayMatchPayload): Promise<ThreeWayMatchResult> => {
    const res = await api.post<any>('/api/v1/inventory/procurement/three-way-match', dto);
    return res?.data || res;
  },

  // 8.4 Inventory Movements, Spoilage & Stocktake Audits
  recordWastage: async (warehouseId: string, dto: RecordWastagePayload): Promise<any> => {
    return await api.post(`/api/v1/inventory/valuation/wastage/${warehouseId}`, dto);
  },

  reconcileStocktake: async (dto: PhysicalStocktakeAdjustmentPayload): Promise<any> => {
    return await api.post('/api/v1/inventory/valuation/stocktake/reconcile', dto);
  },

  // 8.5 Stock Valuation & Reorder Intelligence
  calculateValuation: async (warehouseId: string, method: 'FIFO' | 'WAC' = 'FIFO'): Promise<InventoryValuationResult> => {
    const res = await api.get<any>(`/api/v1/inventory/valuation/warehouse/${warehouseId}?method=${method}`);
    return res?.data || res;
  },

  getReorderAlerts: async (): Promise<{ totalAlerts: number; alerts: ReorderAlert[] }> => {
    try {
      const res = await api.get<any>('/api/v1/inventory/valuation/alerts/reorder-thresholds');
      return res?.data || res || { totalAlerts: 0, alerts: [] };
    } catch {
      return { totalAlerts: 0, alerts: [] };
    }
  },
};
