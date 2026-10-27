import { api } from '@/lib/api/client';

export interface CouponItem {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minSpend: number;
  totalUsageLimit: number;
  usedCount: number;
  status: string;
}

export interface CreateCouponDto {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minSpend?: number;
  totalUsageLimit?: number;
  validFrom?: string;
  validUntil?: string;
}

export const couponsService = {
  getAll: async (): Promise<CouponItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/loyalty/coupons');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((c: any) => ({
        id: c.id,
        code: c.code,
        discountType: c.discountType || (c.type === 'fixed' ? 'FIXED_AMOUNT' : 'PERCENTAGE'),
        discountValue: Number(c.discountValue || c.value || 0),
        minSpend: Number(c.minSpend || 0),
        totalUsageLimit: Number(c.totalUsageLimit || c.usageLimit || 0),
        usedCount: Number(c.usedCount || 0),
        status: c.isActive !== false ? 'Active' : 'Inactive',
      }));
    } catch (error) {
      return [];
    }
  },

  create: async (dto: CreateCouponDto): Promise<CouponItem> => {
    const res = await api.post<any>('/api/v1/loyalty/coupons', dto);
    return {
      id: res.id || `c-${Date.now()}`,
      code: res.code || dto.code,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minSpend: dto.minSpend || 0,
      totalUsageLimit: dto.totalUsageLimit || 100,
      usedCount: 0,
      status: 'Active',
    };
  },
};
