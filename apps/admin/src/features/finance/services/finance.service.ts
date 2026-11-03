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

export interface ChartOfAccountItem {
  id?: string;
  code: string;
  name: string;
  category: string;
  type: 'DEBIT' | 'CREDIT' | string;
  balance?: number;
  description?: string;
}

export interface JournalVoucherItem {
  id: string;
  date: string;
  reference: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  status: string;
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
    return (
      res?.data ||
      res || {
        period: 'Current Fiscal Period',
        totalRevenue: 0,
        roomRevenue: 0,
        posRevenue: 0,
        totalExpenses: 0,
        netOperatingIncome: 0,
      }
    );
  },

  getBalanceSheet: async (): Promise<any> => {
    return await api.get('/api/v1/accounting/reports/balance-sheet');
  },

  getChartOfAccounts: async (): Promise<ChartOfAccountItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/accounting/coa');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createAccount: async (data: Partial<ChartOfAccountItem>): Promise<any> => {
    return await api.post('/api/v1/accounting/coa', data);
  },

  getJournals: async (): Promise<JournalVoucherItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/accounting/journals');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createJournal: async (data: any): Promise<any> => {
    return await api.post('/api/v1/accounting/journals', data);
  },

  // Bank Reconciliation & Treasury (Chapter 7.6)
  getBankAccounts: async (): Promise<any[]> => {
    try {
      const res = await api.get<any>('/api/v1/accounting/banking/accounts');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  importBankStatement: async (dto: {
    bankAccountId: string;
    statementDate: string;
    fileName: string;
    fileFormat?: string;
    transactions?: any[];
  }): Promise<any> => {
    return await api.post('/api/v1/accounting/banking/statements/import', dto);
  },

  reconcileBankStatement: async (dto: {
    statementId: string;
    toleranceDays?: number;
  }): Promise<any> => {
    return await api.post('/api/v1/accounting/banking/statements/reconcile', dto);
  },
};
