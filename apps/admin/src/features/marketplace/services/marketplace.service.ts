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
        name: v.name || v.businessName || v.fullName || 'Property Host',
        email: v.email || 'host@partner.com',
        phone: v.phone || '—',
        businessEntity: v.businessEntity || 'Hospitality Partner',
        kycStatus: v.kycStatus || (v.isVerified ? 'VERIFIED' : 'PENDING'),
        totalListings: v.totalListings || 0,
        totalEarnings: v.totalEarnings || 0,
        commissionRate: v.commissionRate || 15,
        createdAt: v.createdAt || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  getPlans: async () => {
    try {
      return await api.get<any>('/api/v1/marketplace/vendors/plans');
    } catch {
      return [];
    }
  },
};
