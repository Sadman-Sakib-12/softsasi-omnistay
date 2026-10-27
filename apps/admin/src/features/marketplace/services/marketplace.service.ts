import { api } from '@/lib/api/client';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessEntity?: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  totalListings?: number;
  totalEarnings?: number;
  commissionRate?: number;
  createdAt: string;
}

export const marketplaceService = {
  getVendors: async (): Promise<Vendor[]> => {
    try {
      const res = await api.get<any>('/api/v1/marketplace/vendors');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((v: any) => ({
        id: v.id || `vendor-${Date.now()}`,
        name: v.name || v.businessName || v.fullName || '',
        email: v.email || '',
        phone: v.phone || '',
        businessEntity: v.businessEntity || '',
        kycStatus: v.kycStatus || (v.isVerified ? 'VERIFIED' : 'PENDING'),
        totalListings: Number(v.totalListings || 0),
        totalEarnings: Number(v.totalEarnings || 0),
        commissionRate: Number(v.commissionRate || 0),
        createdAt: v.createdAt || new Date().toISOString(),
      }));
    } catch (error) {
      return [];
    }
  },

  getPlans: async () => {
    try {
      return await api.get<any>('/api/v1/marketplace/vendors/plans');
    } catch (error) {
      return [];
    }
  },
};
