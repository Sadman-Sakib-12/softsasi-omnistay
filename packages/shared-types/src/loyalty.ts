export interface WalletDto {
  id?: string;
  userId: string;
  balance?: number;
  currency?: string;
  isLocked?: boolean;
}

export interface WalletTransactionDto {
  id?: string;
  walletId: string;
  amount: number;
  type: 'deposit' | 'payment' | 'refund' | 'bonus';
  description?: string | null;
  referenceId?: string | null;
}

export interface LoyaltyMemberDto {
  id?: string;
  userId: string;
  tierId: string;
  points?: number;
}

export interface GiftCardDto {
  id?: string;
  code: string;
  initialVal: number;
  currentVal: number;
  currency?: string;
  recipientEmail: string;
  senderEmail?: string | null;
  isRedeemed?: boolean;
}

export interface ReferralLinkDto {
  id?: string;
  userId: string;
  referralCode: string;
  clicksCount?: number;
}

export interface CouponDto {
  id?: string;
  tenantId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend?: number | null;
  maxRedemptions?: number | null;
  validFrom: Date;
  validUntil: Date;
  isActive?: boolean;
}
