export const MARKETPLACE_REPOSITORY_TOKEN = Symbol('IMarketplaceRepository');

export interface IMarketplaceRepository {
  createVendorPlan(data: { planName: string; maxListings: number; feePercent: number; monthlyFee: number }): Promise<any>;
  findVendorPlans(): Promise<any[]>;
  findVendorByUserId(userId: string): Promise<any | null>;
  createVendor(data: {
    tenantId: string;
    userId: string;
    businessName: string;
    taxId?: string;
    commissionRate: number;
    balance: number;
    status: string;
    isVerified: boolean;
  }): Promise<any>;
  findVendors(tenantId: string): Promise<any[]>;
  findVendorById(id: string): Promise<any | null>;
  createKycSubmission(data: { vendorId: string; documentType: string; documentUrl: string; status: string }): Promise<any>;
  findKycById(id: string): Promise<any | null>;
  updateKyc(id: string, data: Record<string, any>): Promise<any>;
  updateVendor(id: string, data: Record<string, any>): Promise<any>;
  createTeamMember(data: { vendorId: string; userId: string; role: string }): Promise<any>;
  findTeamMembers(vendorId: string): Promise<any[]>;

  createCommission(data: {
    vendorId: string;
    bookingId: string;
    grossAmount: number;
    commissionAmt: number;
    netVendorAmt: number;
  }): Promise<any>;
  findCommissions(vendorId: string): Promise<any[]>;

  createPayoutMethod(data: { vendorId: string; methodType: string; details: any; isDefault: boolean }): Promise<any>;
  findPayoutMethods(vendorId: string): Promise<any[]>;
  createWithdrawal(data: { vendorId: string; amount: number; status: string }): Promise<any>;
  findWithdrawalById(id: string): Promise<any | null>;
  updateWithdrawal(id: string, data: Record<string, any>): Promise<any>;
  createPayout(data: {
    vendorId: string;
    amount: number;
    payoutMethod: string;
    status: string;
    reference: string;
    processedAt: Date;
  }): Promise<any>;
  findWithdrawals(vendorId: string): Promise<any[]>;
  findPayouts(vendorId: string): Promise<any[]>;

  findBookingById(bookingId: string): Promise<any | null>;
  findReviewByBookingId(bookingId: string): Promise<any | null>;
  createReview(data: {
    bookingId: string;
    overallScore: number;
    comment?: string;
    isVerifiedStay: boolean;
    ratings?: Array<{ dimension: string; score: number }>;
  }): Promise<any>;
  findReviewById(id: string): Promise<any | null>;
  createHostReply(data: { reviewId: string; replyText: string }): Promise<any>;
  findReviewsByBookings(bookingIds: string[]): Promise<any[]>;
}
