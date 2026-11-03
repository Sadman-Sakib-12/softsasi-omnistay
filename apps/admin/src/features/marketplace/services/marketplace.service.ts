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

export interface KycSubmission {
  id: string;
  vendorId: string;
  vendorName: string;
  documentType: string;
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export const marketplaceService = {
  getVendors: async (): Promise<Vendor[]> => {
    try {
      const res = await api.get<any>('/api/v1/marketplace/vendors');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((v: any) => ({
        id: v.id || `vendor-${Date.now()}`,
        name: v.name || v.businessName || v.fullName || 'Host Partner',
        email: v.email || (v.user ? v.user.email : ''),
        phone: v.phone || (v.user ? v.user.phone : ''),
        businessEntity: v.businessEntity || 'Independent Host',
        kycStatus: v.kycStatus || (v.isVerified ? 'VERIFIED' : 'PENDING'),
        totalListings: Number(v.totalListings || 0),
        totalEarnings: Number(v.totalEarnings || 0),
        commissionRate: Number(v.commissionRate || 15),
        createdAt: v.createdAt || new Date().toISOString(),
      }));
    } catch (error) {
      return [];
    }
  },

  getKycSubmissions: async (): Promise<KycSubmission[]> => {
    try {
      const res = await api.get<any>('/api/v1/marketplace/vendors/kyc/submissions');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((k: any) => ({
        id: k.id,
        vendorId: k.vendorId,
        vendorName: k.vendor?.businessName || k.vendor?.name || 'Verified Host',
        documentType: k.documentType || 'Passport / Trade License',
        documentUrl: k.documentUrl || '#',
        status: k.status || 'pending',
        reviewedBy: k.reviewedBy,
        reviewedAt: k.reviewedAt,
        createdAt: k.createdAt || new Date().toISOString(),
      }));
    } catch (error) {
      return [];
    }
  },

  reviewKyc: async (kycId: string, status: 'verified' | 'rejected'): Promise<any> => {
    return await api.patch(`/api/v1/marketplace/vendors/kyc/${kycId}/review`, { status });
  },

  getPlans: async () => {
    try {
      return await api.get<any>('/api/v1/marketplace/vendors/plans');
    } catch (error) {
      return [];
    }
  },
};
