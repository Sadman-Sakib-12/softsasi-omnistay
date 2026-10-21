export const LOYALTY_REPOSITORY_TOKEN = Symbol('ILoyaltyRepository');

export interface ILoyaltyRepository {
  findWalletByUserId(userId: string): Promise<any | null>;
  createWallet(data: { userId: string; currency: string; balance: number; isLocked: boolean }): Promise<any>;
  updateWallet(id: string, data: Record<string, any>): Promise<any>;
  createWalletTransaction(data: {
    walletId: string;
    amount: number;
    type: string;
    referenceId?: string;
    description?: string;
  }): Promise<any>;
  findWalletTransactions(walletId: string): Promise<any[]>;

  createTier(data: { name: string; minPoints: number; multiplier: number; perks?: any }): Promise<any>;
  findTiers(): Promise<any[]>;
  findBaseTier(): Promise<any | null>;
  findTierForPoints(points: number): Promise<any | null>;
  findMemberByUserId(userId: string): Promise<any | null>;
  createMember(data: { userId: string; tierId: string; points: number }): Promise<any>;
  updateMember(id: string, data: Record<string, any>): Promise<any>;
  createPointsLedger(data: { memberId: string; pointsDelta: number; reason: string }): Promise<any>;
  findPointsLedger(memberId: string): Promise<any[]>;

  createGiftCard(data: {
    code: string;
    initialVal: number;
    currentVal: number;
    currency: string;
    recipientEmail: string;
    senderEmail?: string;
    isRedeemed: boolean;
    expiresAt?: Date | null;
  }): Promise<any>;
  findGiftCardByCode(code: string): Promise<any | null>;
  updateGiftCard(id: string, data: Record<string, any>): Promise<any>;
  createGiftCardRedemption(data: { giftCardId: string; userId: string; amountUsed: number }): Promise<any>;
  findGiftCardRedemptions(giftCardId: string): Promise<any[]>;

  findReferralLinkByUserId(userId: string): Promise<any | null>;
  findReferralLinkByCode(referralCode: string): Promise<any | null>;
  createReferralLink(data: { userId: string; referralCode: string; clicksCount: number }): Promise<any>;
  incrementReferralClicks(referralCode: string): Promise<any>;
  createReferralCommission(data: { referralLinkId: string; bookingId: string; commissionAmt: number; status: string }): Promise<any>;

  createCoupon(data: {
    tenantId: string;
    code: string;
    discountType: string;
    discountValue: number;
    minSpend?: number;
    maxRedemptions?: number;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
  }): Promise<any>;
  findCoupons(tenantId: string): Promise<any[]>;
  findCouponByCode(tenantId: string, code: string): Promise<any | null>;
  updateCoupon(id: string, data: Record<string, any>): Promise<any>;
  createCouponUsage(data: { couponId: string; userId: string; bookingId?: string; discountGot: number }): Promise<any>;
}
