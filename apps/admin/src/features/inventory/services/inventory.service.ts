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
        sku: item.sku || item.code || '',
        name: item.name || item.title || '',
        category: item.category || 'General',
        currentStock: Number(item.currentStock ?? item.stock ?? item.quantity ?? 0),
        reorderPoint: Number(item.reorderPoint ?? 0),
        unitCost: Number(item.costPrice ?? item.unitCost ?? 0),
        status: (Number(item.currentStock ?? 0) <= Number(item.reorderPoint ?? 0)) ? 'LOW_STOCK' : 'IN_STOCK',
      }));
    } catch (error) {
      return [];
    }
  },

  createProduct: async (dto: any) => {
    return await api.post('/api/v1/inventory/products', dto);
  },
};
