import { api } from '@/lib/api/client';

export interface NightAuditResult {
  auditDate: string;
  roomsAudited: number;
  revenuePosted: number;
  status: string;
  executionTimestamp?: string;
  details?: {
    roomRevenue: number;
    lodgingTax: number;
    advancesRecognized: number;
    trialBalanceBalanced: boolean;
  };
}

export interface PnLReport {
  reportingStandard: string;
  currency: string;
  totalRevenue?: number;
  revenue: {
    roomRevenue: number;
    foodAndBeverage: number;
    otherOperatedDepartments: number;
    totalRevenue: number;
  };
  directExpenses: {
    costOfGoodsSold: number;
    grossOperatingMargin: number;
  };
  operatingExpenses: {
    laborAndPayroll: number;
    utilities: number;
    maintenanceAndRepairs: number;
    otherOpex: number;
    totalOpex: number;
  };
  summary: {
    grossOperatingProfit: number;
    gopMarginPercent: number;
    netProfit: number;
  };
}

export interface BalanceSheetReport {
  asOfDate: string;
  currency: string;
  assets: {
    currentAssets: number;
    fixedAssets: number;
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: number;
    longTermLiabilities: number;
    totalLiabilities: number;
  };
  equity: {
    shareholderEquity: number;
    totalLiabilitiesAndEquity: number;
  };
  isBalanced: boolean;
}

export interface CashFlowReport {
  period: string;
  currency: string;
  operatingActivities: {
    netIncome: number;
    operatingCashFlow: number;
  };
  investingActivities: {
    propertyAcquisitions: number;
    investingCashFlow: number;
  };
  financingActivities: {
    capitalContributions: number;
    debtRepayments: number;
    financingCashFlow: number;
  };
  netChangeInCash: number;
}

export interface ChartOfAccountItem {
  id?: string;
  code: string;
  name: string;
  type: string;
  subType?: string;
  isActive?: boolean;
  balance?: number;
}

export interface JournalVoucherItem {
  id: string;
  entryNumber: string;
  date: string;
  reference?: string;
  description?: string;
  isPosted: boolean;
  items: Array<{
    id: string;
    account: { code: string; name: string };
    debit: number;
    credit: number;
  }>;
}

export interface BudgetVarianceItem {
  budgetId: string;
  department: string;
  fiscalYear: string;
  month: number;
  budgetedAmount: number;
  actualSpent: number;
  variance: number;
  variancePercent: number;
  burnRatePercent: number;
  isOverBudget: boolean;
  status: 'OVER_BUDGET' | 'ON_TRACK';
  alertColor: 'rose' | 'emerald';
}

export interface BudgetVarianceResponse {
  fiscalYear: string;
  month: number;
  currency: string;
  summary: {
    totalBudgeted: number;
    totalActual: number;
    netVariance: number;
    overallStatus: string;
    flaggedOverBudgetCount: number;
  };
  departments: BudgetVarianceItem[];
}

export interface BankAccountItem {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  chartOfAccount?: { code: string; name: string };
}

export interface CashRegisterItem {
  id: string;
  registerName: string;
  location: string;
  currentFloat: number;
  isActive: boolean;
  shifts?: Array<{
    id: string;
    cashierId: string;
    openingFloat: number;
    closingCash?: number;
    openedAt: string;
    closedAt?: string;
  }>;
}

export interface AgingAnalysisItem {
  customerId: string;
  customerName: string;
  email: string;
  current: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  daysOver90: number;
  totalOutstanding: number;
}

export interface AgingReportResponse {
  asOfDate: string;
  currency: string;
  totals: {
    current: number;
    days1To30: number;
    days31To60: number;
    days61To90: number;
    daysOver90Risk: number;
    grandTotal: number;
  };
  customerAging: AgingAnalysisItem[];
}

export interface BillItem {
  id: string;
  billNumber: string;
  vendorId?: string;
  purchaseOrderId?: string;
  billDate: string;
  dueDate: string;
  grandTotal: number;
  status: string;
  items: Array<{
    description: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
}

export const financeService = {
  // 7.2 Automated Night Audit Engine
  runNightAudit: async (auditDate?: string): Promise<NightAuditResult> => {
    const targetDate = auditDate || new Date().toISOString().split('T')[0];
    const res = await api.post<any>('/api/v1/accounting/night-audit/run', {
      auditDate: targetDate,
      forceRun: true,
    });
    return res?.data || res;
  },

  getAuditStatus: async (): Promise<any> => {
    try {
      const res = await api.get<any>('/api/v1/accounting/night-audit/history');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  // 7.1 USALI Chart of Accounts
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

  // 7.1 General Ledger & Journals
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

  // 7.8 Real-Time Financial Statements
  getPnL: async (): Promise<PnLReport> => {
    const res = await api.get<any>('/api/v1/accounting/reports/pnl');
    const data = res?.data || res;
    if (data) {
      return {
        ...data,
        totalRevenue: data.revenue?.totalRevenue || data.totalRevenue || 0,
      };
    }
    return {
      reportingStandard: 'USALI (11th Edition)',
      currency: 'USD',
      totalRevenue: 0,
      revenue: { roomRevenue: 0, foodAndBeverage: 0, otherOperatedDepartments: 0, totalRevenue: 0 },
      directExpenses: { costOfGoodsSold: 0, grossOperatingMargin: 0 },
      operatingExpenses: { laborAndPayroll: 0, utilities: 0, maintenanceAndRepairs: 0, otherOpex: 0, totalOpex: 0 },
      summary: { grossOperatingProfit: 0, gopMarginPercent: 0, netProfit: 0 },
    };
  },

  getBalanceSheet: async (): Promise<BalanceSheetReport> => {
    const res = await api.get<any>('/api/v1/accounting/reports/balance-sheet');
    return (
      res?.data ||
      res || {
        asOfDate: new Date().toISOString().split('T')[0],
        currency: 'USD',
        assets: { currentAssets: 0, fixedAssets: 0, totalAssets: 0 },
        liabilities: { currentLiabilities: 0, longTermLiabilities: 0, totalLiabilities: 0 },
        equity: { shareholderEquity: 0, totalLiabilitiesAndEquity: 0 },
        isBalanced: true,
      }
    );
  },

  getCashFlow: async (): Promise<CashFlowReport> => {
    const res = await api.get<any>('/api/v1/accounting/reports/cash-flow');
    return (
      res?.data ||
      res || {
        period: 'Year to Date',
        currency: 'USD',
        operatingActivities: { netIncome: 0, operatingCashFlow: 0 },
        investingActivities: { propertyAcquisitions: 0, investingCashFlow: 0 },
        financingActivities: { capitalContributions: 0, debtRepayments: 0, financingCashFlow: 0 },
        netChangeInCash: 0,
      }
    );
  },

  // 7.7 Budgeting & Departmental Forecasting
  getBudgets: async (fiscalYear = '2026'): Promise<any[]> => {
    try {
      const res = await api.get<any>(`/api/v1/accounting/budgets?fiscalYear=${fiscalYear}`);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getBudgetVariance: async (fiscalYear = '2026', month = 10): Promise<BudgetVarianceResponse> => {
    const res = await api.get<any>(`/api/v1/accounting/budgets/variance?fiscalYear=${fiscalYear}&month=${month}`);
    return (
      res?.data ||
      res || {
        fiscalYear,
        month,
        currency: 'USD',
        summary: { totalBudgeted: 0, totalActual: 0, netVariance: 0, overallStatus: 'ON_TRACK', flaggedOverBudgetCount: 0 },
        departments: [],
      }
    );
  },

  createBudget: async (dto: any): Promise<any> => {
    return await api.post('/api/v1/accounting/budgets', dto);
  },

  // 7.5 Multi-Bank & Cash Registers
  getBankAccounts: async (): Promise<BankAccountItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/accounting/banking/accounts');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createBankAccount: async (dto: any): Promise<any> => {
    return await api.post('/api/v1/accounting/banking/accounts', dto);
  },

  transferFunds: async (dto: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: string;
    fee?: number;
    reference?: string;
  }): Promise<any> => {
    return await api.post('/api/v1/accounting/banking/transfers', dto);
  },

  getCashRegisters: async (): Promise<CashRegisterItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/accounting/banking/registers');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  openRegisterShift: async (dto: { registerId: string; openingFloat: number }): Promise<any> => {
    return await api.post('/api/v1/accounting/banking/registers/shifts/open', dto);
  },

  closeRegisterShift: async (dto: { shiftId: string; closingCash: number }): Promise<any> => {
    return await api.post('/api/v1/accounting/banking/registers/shifts/close', dto);
  },

  getActiveShift: async (): Promise<any> => {
    try {
      const res = await api.get<any>('/api/v1/accounting/banking/registers/shifts/active');
      return res?.data || res || null;
    } catch {
      return null;
    }
  },

  // 7.6 Bank Reconciliation Engine
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

  // 7.3 Accounts Receivable & Corporate Direct Billing
  getAgingReport: async (): Promise<AgingReportResponse> => {
    const res = await api.get<any>('/api/v1/accounting/ar/aging');
    return (
      res?.data ||
      res || {
        asOfDate: new Date().toISOString().split('T')[0],
        currency: 'USD',
        totals: { current: 0, days1To30: 0, days31To60: 0, days61To90: 0, daysOver90Risk: 0, grandTotal: 0 },
        customerAging: [],
      }
    );
  },

  getInvoices: async (): Promise<any[]> => {
    try {
      const res = await api.get<any>('/api/v1/accounting/ar/invoices');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createInvoice: async (dto: any): Promise<any> => {
    return await api.post('/api/v1/accounting/ar/invoices', dto);
  },

  // 7.4 Accounts Payable & 3-Way Match
  getBills: async (): Promise<BillItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/accounting/ap/bills');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createBill: async (dto: any): Promise<any> => {
    return await api.post('/api/v1/accounting/ap/bills', dto);
  },

  performThreeWayMatch: async (dto: {
    billId: string;
    purchaseOrderId: string;
    grnId?: string;
  }): Promise<any> => {
    return await api.post('/api/v1/accounting/ap/3-way-match', dto);
  },

  recordBillPayment: async (billId: string, dto: any): Promise<any> => {
    return await api.post(`/api/v1/accounting/ap/bills/${billId}/payments`, dto);
  },

  createDebitNote: async (dto: { billId: string; amount: number; reason: string }): Promise<any> => {
    return await api.post('/api/v1/accounting/ap/debit-notes', dto);
  },
};
