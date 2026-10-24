import { api } from '@/lib/api/client';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  unitCost: number;
  status: string;
}

export const inventoryService = {
  getProducts: async (): Promise<InventoryItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/inventory/products');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((item: any) => ({
        id: item.id || `inv-${Date.now()}`,
        sku: item.sku || item.code || 'SKU-001',
        name: item.name || item.title || 'Inventory Item',
        category: item.category || 'Kitchen Supplies',
        currentStock: item.currentStock ?? item.stock ?? item.quantity ?? 0,
        reorderPoint: item.reorderPoint ?? 10,
        unitCost: item.costPrice ?? item.unitCost ?? 0,
        status: (item.currentStock ?? 0) <= (item.reorderPoint ?? 10) ? 'LOW_STOCK' : 'IN_STOCK',
      }));
    } catch {
      return [];
    }
  },

  createProduct: async (dto: any) => {
    return await api.post('/api/v1/inventory/products', dto);
  },
};
