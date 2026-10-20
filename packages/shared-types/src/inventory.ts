export type StockValuationMethod = 'FIFO' | 'WAC';
export type StockChangeType = 
  | 'purchase_received' 
  | 'sale_consumed' 
  | 'transfer_in' 
  | 'transfer_out' 
  | 'spoilage_wastage' 
  | 'audit_adjustment';

export type ProcurementStatus = 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'received' | 'cancelled';
export type GrnStatus = 'inspected' | 'partially_received' | 'rejected' | 'accepted';

export interface IWarehouse {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address?: string;
  isActive: boolean;
}

export interface IProduct {
  id: string;
  tenantId: string;
  categoryId?: string;
  unitId?: string;
  name: string;
  sku: string;
  barcode?: string;
  costPrice: number;
  retailPrice: number;
  isRecipe: boolean;
  status: string;
}

export interface IWarehouseProductStock {
  id: string;
  warehouseId: string;
  productId: string;
  stockQty: number;
  reorderLevel: number;
}

export interface IWarehouseTransfer {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  transferNumber: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
}

export interface IPurchaseOrder {
  id: string;
  tenantId: string;
  poNumber: string;
  vendorId?: string;
  totalCost: number;
  status: ProcurementStatus;
}

export interface IGoodsReceivedNote {
  id: string;
  purchaseId: string;
  grnNumber: string;
  receivedDate: string;
  receivedBy?: string;
  status: GrnStatus;
}

export interface IInventoryWastageLog {
  id: string;
  productId: string;
  quantity: number;
  reason: string;
  costLost: number;
  reportedBy?: string;
}

export interface IReorderAlert {
  id: string;
  productId: string;
  currentQty: number;
  threshold: number;
  isResolved: boolean;
}
