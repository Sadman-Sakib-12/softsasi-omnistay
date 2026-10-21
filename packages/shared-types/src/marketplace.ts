export interface VendorDto {
  id?: string;
  tenantId: string;
  userId: string;
  businessName: string;
  taxId?: string | null;
  isVerified?: boolean;
  commissionRate?: number;
  balance?: number;
  status?: string;
}

export interface VendorKycSubmissionDto {
  id?: string;
  vendorId: string;
  documentType: string;
  documentUrl: string;
  status?: 'pending' | 'verified' | 'rejected';
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
}

export interface VendorCommissionDto {
  id?: string;
  vendorId: string;
  bookingId: string;
  grossAmount: number;
  commissionAmt: number;
  netVendorAmt: number;
}

export interface VendorPayoutDto {
  id?: string;
  vendorId: string;
  amount: number;
  payoutMethod: string;
  status?: 'pending' | 'completed' | 'failed';
  reference?: string | null;
}

export interface GuestReviewDto {
  id?: string;
  bookingId: string;
  overallScore: number;
  comment?: string | null;
  isVerifiedStay?: boolean;
}
