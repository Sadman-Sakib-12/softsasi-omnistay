import { api } from '@/lib/api/client';

export interface WalletSummary {
  totalStoredValueLiability: number;
  totalActiveWallets: number;
  totalTopUpVolume: number;
  instantRefundVolume: number;
}

export interface LoyaltyTierItem {
  id: string;
  name: string;
  qualifyingNights: number;
  multiplier: number;
  perks: string;
}

export interface GiftCardItem {
  id: string;
  code: string;
  recipientEmail: string;
  amount: number;
  balance: number;
  status: string;
  createdAt: string;
}

export interface CreateGiftCardDto {
  recipientEmail: string;
  amount: number;
  theme?: string;
  message?: string;
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

  getLoyaltyTiers: async (): Promise<LoyaltyTierItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/loyalty/program');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((t: any) => ({
        id: t.id,
        name: t.name,
        qualifyingNights: Number(t.qualifyingNights || 0),
        multiplier: Number(t.multiplier || 1.0),
        perks: t.perks || '',
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
        recipientEmail: g.recipientEmail || g.recipient || '',
        amount: Number(g.amount || 0),
        balance: Number(g.balance ?? g.amount ?? 0),
        status: g.status || 'Active',
        createdAt: g.createdAt ? g.createdAt.split('T')[0] : '',
      }));
    } catch (error) {
      return [];
    }
  },

  createGiftCard: async (dto: CreateGiftCardDto): Promise<GiftCardItem> => {
    const res = await api.post<any>('/api/v1/loyalty/gift-cards', dto);
    return {
      id: res.id || `gc-${Date.now()}`,
      code: res.code || res.cardCode || '',
      recipientEmail: dto.recipientEmail,
      amount: dto.amount,
      balance: dto.amount,
      status: res.status || 'Active',
      createdAt: res.createdAt ? res.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    };
  },
};
