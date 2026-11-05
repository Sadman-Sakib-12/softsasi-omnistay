import { api } from '@/lib/api/client';

export interface VendorTeamMemberItem {
  id: string;
  vendorId: string;
  userId: string;
  role: 'Property Manager' | 'Front Desk / Check-In Staff' | 'Cleaner / Housekeeper' | string;
  createdAt: string;
}

export interface VendorPayoutMethodItem {
  id: string;
  vendorId: string;
  methodType: 'stripe_connect' | 'bank_wire' | 'paypal' | string;
  details: Record<string, any>;
  isDefault: boolean;
  createdAt: string;
}

export interface KycSubmissionItem {
  id: string;
  vendorId: string;
  vendorName: string;
  documentType: string;
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected' | string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface VendorItem {
  id: string;
  userId: string;
  businessName: string;
  taxId?: string;
  isVerified: boolean;
  commissionRate: number;
  balance: number;
  status: 'active' | 'pending' | 'suspended' | string;
  payoutMethods?: VendorPayoutMethodItem[];
  teamMembers?: VendorTeamMemberItem[];
  kycSubmissions?: KycSubmissionItem[];
  createdAt: string;
}

export interface VendorCommissionItem {
  id: string;
  vendorId: string;
  bookingId: string;
  grossAmount: number;
  commissionAmt: number;
  netVendorAmt: number;
  createdAt: string;
  vendor?: {
    id: string;
    businessName: string;
    commissionRate: number;
  };
}

export interface VendorWithdrawalItem {
  id: string;
  vendorId: string;
  amount: number;
  status: 'requested' | 'paid' | 'rejected' | string;
  requestedAt: string;
  paidAt?: string | null;
  vendor?: {
    id: string;
    businessName: string;
    balance: number;
  };
}

export interface VendorPayoutItem {
  id: string;
  vendorId: string;
  amount: number;
  payoutMethod: string;
  status: string;
  reference?: string | null;
  processedAt?: string | null;
  createdAt: string;
  vendor?: {
    id: string;
    businessName: string;
  };
}

export interface ReviewCriteriaRatingItem {
  id: string;
  dimension: 'Cleanliness' | 'Location' | 'Service / Hospitality' | 'Amenities' | 'Value for Money' | string;
  score: number;
}

export interface ReviewHostReplyItem {
  id: string;
  replyText: string;
  repliedAt: string;
}

export interface GuestReviewItem {
  id: string;
  bookingId: string;
  overallScore: number;
  comment?: string;
  isVerifiedStay: boolean;
  ratings?: ReviewCriteriaRatingItem[];
  hostReplies?: ReviewHostReplyItem[];
  createdAt: string;
}

export interface VendorPlanItem {
  id: string;
  planName: string;
  maxListings: number;
  feePercent: number;
  monthlyFee: number;
  createdAt: string;
}

// Backward compatibility interfaces
export type Vendor = VendorItem;
export type KycSubmission = KycSubmissionItem;

export const marketplaceService = {
  // 12.1 Vendors & KYC
  getVendors: async (): Promise<VendorItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/marketplace/vendors');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data;
    } catch {
      return [];
    }
  },

  getVendorById: async (id: string): Promise<VendorItem | null> => {
    try {
      const res = await api.get<any>(`/api/v1/marketplace/vendors/${id}`);
      return res?.data || res || null;
    } catch {
      return null;
    }
  },

  registerVendor: async (dto: { businessName: string; taxId?: string; commissionRate?: number }) => {
    return await api.post('/api/v1/marketplace/vendors/register', dto);
  },

  getKycSubmissions: async (status?: string): Promise<KycSubmissionItem[]> => {
    try {
      const url = status
        ? `/api/v1/marketplace/vendors/kyc/submissions?status=${status}`
        : '/api/v1/marketplace/vendors/kyc/submissions';
      const res = await api.get<any>(url);
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((k: any) => ({
        id: k.id,
        vendorId: k.vendorId,
        vendorName: k.vendor?.businessName || 'Verified Host',
        documentType: k.documentType || 'Passport / Operating License',
        documentUrl: k.documentUrl || '#',
        status: k.status || 'pending',
        reviewedBy: k.reviewedBy,
        reviewedAt: k.reviewedAt,
        createdAt: k.createdAt || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  submitKyc: async (vendorId: string, dto: { documentType: string; documentUrl: string }) => {
    return await api.post(`/api/v1/marketplace/vendors/${vendorId}/kyc`, dto);
  },

  reviewKyc: async (kycId: string, status: 'verified' | 'rejected') => {
    return await api.patch(`/api/v1/marketplace/vendors/kyc/${kycId}/review`, { status });
  },

  // 12.2 Plans & Granular Commission
  getPlans: async (): Promise<VendorPlanItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/marketplace/vendors/plans');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createPlan: async (dto: { planName: string; maxListings: number; feePercent: number; monthlyFee: number }) => {
    return await api.post('/api/v1/marketplace/vendors/plans', dto);
  },

  getCommissions: async (vendorId?: string): Promise<VendorCommissionItem[]> => {
    try {
      const url = vendorId ? `/api/v1/marketplace/commissions?vendorId=${vendorId}` : '/api/v1/marketplace/commissions';
      const res = await api.get<any>(url);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  calculateCommission: async (dto: { vendorId: string; bookingId: string; grossAmount: number; vertical?: string }) => {
    return await api.post('/api/v1/marketplace/commissions/calculate', dto);
  },

  // 12.4 Payouts & Withdrawals
  getPayoutMethods: async (vendorId: string): Promise<VendorPayoutMethodItem[]> => {
    try {
      const res = await api.get<any>(`/api/v1/marketplace/payouts/methods/${vendorId}`);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  addPayoutMethod: async (vendorId: string, dto: { methodType: string; details: any }) => {
    return await api.post(`/api/v1/marketplace/payouts/methods/${vendorId}`, dto);
  },

  requestWithdrawal: async (vendorId: string, dto: { amount: number }) => {
    return await api.post(`/api/v1/marketplace/payouts/withdraw/${vendorId}`, dto);
  },

  getWithdrawals: async (vendorId?: string): Promise<VendorWithdrawalItem[]> => {
    try {
      const url = vendorId
        ? `/api/v1/marketplace/payouts/withdrawals/${vendorId}`
        : '/api/v1/marketplace/payouts/withdrawals';
      const res = await api.get<any>(url);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  processPayout: async (dto: { withdrawalId: string; reference?: string }) => {
    return await api.post('/api/v1/marketplace/payouts/process', dto);
  },

  getPayoutHistory: async (vendorId?: string): Promise<VendorPayoutItem[]> => {
    try {
      const url = vendorId
        ? `/api/v1/marketplace/payouts/history/${vendorId}`
        : '/api/v1/marketplace/payouts/history';
      const res = await api.get<any>(url);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  // 12.5 Vendor Team Accounts
  getTeamMembers: async (vendorId: string): Promise<VendorTeamMemberItem[]> => {
    try {
      const res = await api.get<any>(`/api/v1/marketplace/vendors/${vendorId}/team`);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  addTeamMember: async (vendorId: string, dto: { userId: string; role: string }) => {
    return await api.post(`/api/v1/marketplace/vendors/${vendorId}/team`, dto);
  },

  // 12.6 Multi-Criteria Guest Reviews
  getReviews: async (bookingIds?: string[]): Promise<GuestReviewItem[]> => {
    try {
      const q = bookingIds && bookingIds.length ? `?bookingIds=${bookingIds.join(',')}` : '';
      const res = await api.get<any>(`/api/v1/marketplace/reviews${q}`);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  replyReview: async (reviewId: string, dto: { replyText: string }) => {
    return await api.post(`/api/v1/marketplace/reviews/${reviewId}/reply`, dto);
  },
};
