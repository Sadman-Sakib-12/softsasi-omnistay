export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface ChartOfAccountModel {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: AccountType;
  subType?: string | null;
  isActive: boolean;
}

export interface TrialBalanceSnapshot {
  totalDebits: number;
  totalCredits: number;
  variance: number;
  isReconciled: boolean;
}

export interface ProfitAndLossReport {
  reportingStandard: string;
  currency: string;
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
