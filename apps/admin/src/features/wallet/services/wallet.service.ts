import { api } from '@/lib/api/client';

export interface WalletTransactionItem {
  id: string;
  walletId: string;
  amount: number;
  type: string;
  description?: string;
  referenceId?: string;
  createdAt: string;
}

export interface WalletItem {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  isLocked: boolean;
  createdAt: string;
  transactions?: WalletTransactionItem[];
}

export interface WalletSummary {
  totalStoredValueLiability: number;
  totalActiveWallets: number;
  totalTopUpVolume: number;
  instantRefundVolume: number;
}

export interface LoyaltyTierItem {
  id: string;
  name: string;
  minPoints: number;
  multiplier: number;
  perks: any;
}

export interface PointsLedgerItem {
  id: string;
  pointsDelta: number;
  reason: string;
  createdAt: string;
}

export interface LoyaltyMemberItem {
  id: string;
  userId: string;
  points: number;
  tierId: string;
  tier?: LoyaltyTierItem;
  ledger?: PointsLedgerItem[];
}

export interface LoyaltyCatalogItem {
  id: string;
  title: string;
  pointsRequired: number;
  cashValue: number;
  category: string;
  description: string;
}

export interface ReferralCommissionItem {
  id: string;
  bookingId: string;
  commissionAmt: number;
  status: string;
  createdAt: string;
}

export interface ReferralLinkItem {
  id: string;
  userId: string;
  referralCode: string;
  clicksCount: number;
  convertedBookings: number;
  conversionRate: number;
  totalCommissions: number;
  trackingUrl: string;
  qrCodePayload: string;
  commissions?: ReferralCommissionItem[];
}

export interface GiftCardRedemptionItem {
  id: string;
  amountUsed: number;
  redeemedAt: string;
}

export interface GiftCardItem {
  id: string;
  code: string;
  initialVal: number;
  currentVal: number;
  currency: string;
  senderEmail?: string;
  recipientEmail: string;
  isRedeemed: boolean;
  expiresAt?: string;
  createdAt: string;
  redemptions?: GiftCardRedemptionItem[];
}

export interface CreateGiftCardDto {
  recipientEmail: string;
  amount: number;
  senderEmail?: string;
  currency?: string;
  theme?: string;
  message?: string;
}

export interface TopUpWalletDto {
  currency: string;
  amount: number;
  description?: string;
}

export const walletService = {
  getSummary: async (): Promise<WalletSummary> => {
    try {
      const res = await api.get<any>('/api/v1/loyalty/wallets/summary');
      return {
        totalStoredValueLiability: Number(res?.totalStoredValueLiability || 0),
        totalActiveWallets: Number(res?.totalActiveWallets || 0),
        totalTopUpVolume: Number(res?.totalTopUpVolume || 0),
        instantRefundVolume: Number(res?.instantRefundVolume || 0),
      };
    } catch (error) {
      return {
        totalStoredValueLiability: 0,
        totalActiveWallets: 0,
        totalTopUpVolume: 0,
        instantRefundVolume: 0,
      };
    }
  },

  getAllWallets: async (): Promise<WalletItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/loyalty/wallets/all');
      const list = Array.isArray(res) ? res : res?.data || [];
      return list.map((w: any) => ({
        id: w.id,
        userId: w.userId,
        currency: w.currency || 'USD',
        balance: Number(w.balance || 0),
        isLocked: Boolean(w.isLocked),
        createdAt: w.createdAt ? w.createdAt.split('T')[0] : '',
        transactions: (w.transactions || []).map((t: any) => ({
          id: t.id,
          walletId: t.walletId,
          amount: Number(t.amount || 0),
          type: t.type,
          description: t.description,
          referenceId: t.referenceId,
          createdAt: t.createdAt ? t.createdAt.split('T')[0] : '',
        })),
      }));
    } catch (error) {
      return [];
    }
  },

  topUpWallet: async (dto: TopUpWalletDto) => {
    return api.post<any>('/api/v1/loyalty/wallets/top-up', dto);
  },

  getLoyaltyTiers: async (): Promise<LoyaltyTierItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/loyalty/program/tiers');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((t: any) => ({
        id: t.id,
        name: t.name,
        minPoints: Number(t.minPoints || 0),
        multiplier: Number(t.multiplier || 1.0),
        perks: t.perks,
      }));
    } catch (error) {
      return [];
    }
  },

  getLoyaltyMembers: async (): Promise<LoyaltyMemberItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/loyalty/program/members');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((m: any) => ({
        id: m.id,
        userId: m.userId,
        points: Number(m.points || 0),
        tierId: m.tierId,
        tier: m.tier ? {
          id: m.tier.id,
          name: m.tier.name,
          minPoints: Number(m.tier.minPoints || 0),
          multiplier: Number(m.tier.multiplier || 1.0),
          perks: m.tier.perks,
        } : undefined,
        ledger: (m.ledger || []).map((l: any) => ({
          id: l.id,
          pointsDelta: Number(l.pointsDelta || 0),
          reason: l.reason,
          createdAt: l.createdAt ? l.createdAt.split('T')[0] : '',
        })),
      }));
    } catch (error) {
      return [];
    }
  },

  getLoyaltyCatalog: async (): Promise<LoyaltyCatalogItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/loyalty/program/catalog');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((c: any) => ({
        id: c.id,
        title: c.title,
        pointsRequired: Number(c.pointsRequired || 0),
        cashValue: Number(c.cashValue || 0),
        category: c.category,
        description: c.description,
      }));
    } catch (error) {
      return [];
    }
  },

  getAllReferrals: async (): Promise<ReferralLinkItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/loyalty/referrals/all');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        referralCode: r.referralCode,
        clicksCount: Number(r.clicksCount || 0),
        convertedBookings: Number(r.convertedBookings || 0),
        conversionRate: Number(r.conversionRate || 0),
        totalCommissions: Number(r.totalCommissions || 0),
        trackingUrl: r.trackingUrl || `https://omnistay.com/book?ref=${r.referralCode}`,
        qrCodePayload: r.qrCodePayload || `omnistay://referral?code=${r.referralCode}`,
        commissions: (r.commissions || []).map((c: any) => ({
          id: c.id,
          bookingId: c.bookingId,
          commissionAmt: Number(c.commissionAmt || 0),
          status: c.status,
          createdAt: c.createdAt ? c.createdAt.split('T')[0] : '',
        })),
      }));
    } catch (error) {
      return [];
    }
  },

  getGiftCards: async (): Promise<GiftCardItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/loyalty/gift-cards');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((g: any) => ({
        id: g.id,
        code: g.code,
        initialVal: Number(g.initialVal || 0),
        currentVal: Number(g.currentVal ?? g.initialVal ?? 0),
        currency: g.currency || 'USD',
        senderEmail: g.senderEmail,
        recipientEmail: g.recipientEmail,
        isRedeemed: Boolean(g.isRedeemed),
        expiresAt: g.expiresAt ? g.expiresAt.split('T')[0] : undefined,
        createdAt: g.createdAt ? g.createdAt.split('T')[0] : '',
        redemptions: (g.redemptions || []).map((rd: any) => ({
          id: rd.id,
          amountUsed: Number(rd.amountUsed || 0),
          redeemedAt: rd.redeemedAt ? rd.redeemedAt.split('T')[0] : '',
        })),
      }));
    } catch (error) {
      return [];
    }
  },

  createGiftCard: async (dto: CreateGiftCardDto): Promise<GiftCardItem> => {
    const res = await api.post<any>('/api/v1/loyalty/gift-cards/issue', dto);
    return {
      id: res.id,
      code: res.code,
      initialVal: Number(res.initialVal || dto.amount),
      currentVal: Number(res.currentVal || dto.amount),
      currency: res.currency || dto.currency || 'USD',
      senderEmail: res.senderEmail,
      recipientEmail: res.recipientEmail,
      isRedeemed: Boolean(res.isRedeemed),
      expiresAt: res.expiresAt ? res.expiresAt.split('T')[0] : undefined,
      createdAt: res.createdAt ? res.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      redemptions: [],
    };
  },
};
