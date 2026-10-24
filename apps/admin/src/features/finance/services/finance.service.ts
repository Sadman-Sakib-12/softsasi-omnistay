import { api } from '@/lib/api/client';

export interface NightAuditResult {
  auditDate: string;
  roomRevenuePosted: number;
  taxPosted: number;
  roomsProcessed: number;
  status: string;
  executionTimestamp?: string;
}

export interface PnLReport {
  period: string;
  totalRevenue: number;
  roomRevenue: number;
  posRevenue: number;
  totalExpenses: number;
  netOperatingIncome: number;
}

export const financeService = {
  runNightAudit: async (): Promise<NightAuditResult> => {
    return await api.post<NightAuditResult>('/api/v1/accounting/night-audit/run');
  },

  getAuditStatus: async (): Promise<any> => {
    return await api.get('/api/v1/accounting/night-audit/status');
  },

  getPnL: async (): Promise<PnLReport> => {
    const res = await api.get<any>('/api/v1/accounting/reports/pnl');
    return res?.data || res || {
      period: 'Current Fiscal Period',
      totalRevenue: 0,
      roomRevenue: 0,
      posRevenue: 0,
      totalExpenses: 0,
      netOperatingIncome: 0,
    };
  },

  getBalanceSheet: async (): Promise<any> => {
    return await api.get('/api/v1/accounting/reports/balance-sheet');
  },
};
