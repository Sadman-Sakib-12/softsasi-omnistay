'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import { useTenantStore } from '@/stores/tenant-store';

export function useFinance() {
  const queryClient = useQueryClient();
  const { currentTenantId } = useTenantStore();

  // 7.8 Real-Time Reports
  const pnlQuery = useQuery({
    queryKey: ['pnlReport', currentTenantId],
    queryFn: () => financeService.getPnL(),
  });

  const balanceSheetQuery = useQuery({
    queryKey: ['balanceSheet', currentTenantId],
    queryFn: () => financeService.getBalanceSheet(),
  });

  const cashFlowQuery = useQuery({
    queryKey: ['cashFlow', currentTenantId],
    queryFn: () => financeService.getCashFlow(),
  });

  // 7.2 Night Audit History
  const auditStatusQuery = useQuery({
    queryKey: ['auditStatus', currentTenantId],
    queryFn: () => financeService.getAuditStatus(),
  });

  // 7.1 Chart of Accounts
  const coaQuery = useQuery({
    queryKey: ['chartOfAccounts', currentTenantId],
    queryFn: () => financeService.getChartOfAccounts(),
  });

  // 7.1 General Ledger Journals
  const journalsQuery = useQuery({
    queryKey: ['glJournals', currentTenantId],
    queryFn: () => financeService.getJournals(),
  });

  // 7.7 Budgeting & Variance Analysis
  const budgetVarianceQuery = useQuery({
    queryKey: ['budgetVariance', currentTenantId],
    queryFn: () => financeService.getBudgetVariance('2026', 10),
  });

  const budgetsQuery = useQuery({
    queryKey: ['departmentBudgets', currentTenantId],
    queryFn: () => financeService.getBudgets('2026'),
  });

  // 7.5 Multi-Bank & Cash Registers
  const bankAccountsQuery = useQuery({
    queryKey: ['bankAccounts', currentTenantId],
    queryFn: () => financeService.getBankAccounts(),
  });

  const cashRegistersQuery = useQuery({
    queryKey: ['cashRegisters', currentTenantId],
    queryFn: () => financeService.getCashRegisters(),
  });

  const activeShiftQuery = useQuery({
    queryKey: ['activeShift', currentTenantId],
    queryFn: () => financeService.getActiveShift(),
  });

  // 7.3 Accounts Receivable Aging
  const agingQuery = useQuery({
    queryKey: ['arAging', currentTenantId],
    queryFn: () => financeService.getAgingReport(),
  });

  // 7.4 Accounts Payable Bills
  const billsQuery = useQuery({
    queryKey: ['apBills', currentTenantId],
    queryFn: () => financeService.getBills(),
  });

  // Mutations
  const runAuditMutation = useMutation({
    mutationFn: (auditDate?: string) => financeService.runNightAudit(auditDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pnlReport'] });
      queryClient.invalidateQueries({ queryKey: ['balanceSheet'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlow'] });
      queryClient.invalidateQueries({ queryKey: ['auditStatus'] });
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['glJournals'] });
      queryClient.invalidateQueries({ queryKey: ['arAging'] });
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: (data: any) => financeService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
    },
  });

  const createJournalMutation = useMutation({
    mutationFn: (data: any) => financeService.createJournal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glJournals'] });
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['pnlReport'] });
      queryClient.invalidateQueries({ queryKey: ['balanceSheet'] });
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data: any) => financeService.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departmentBudgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetVariance'] });
    },
  });

  const transferFundsMutation = useMutation({
    mutationFn: (data: any) => financeService.transferFunds(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });

  const openShiftMutation = useMutation({
    mutationFn: (data: any) => financeService.openRegisterShift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeShift'] });
      queryClient.invalidateQueries({ queryKey: ['cashRegisters'] });
    },
  });

  const closeShiftMutation = useMutation({
    mutationFn: (data: any) => financeService.closeRegisterShift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeShift'] });
      queryClient.invalidateQueries({ queryKey: ['cashRegisters'] });
    },
  });

  const matchVoucherMutation = useMutation({
    mutationFn: (data: any) => financeService.performThreeWayMatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apBills'] });
    },
  });

  const approveBillMutation = useMutation({
    mutationFn: ({ billId, data }: { billId: string; data: any }) =>
      financeService.recordBillPayment(billId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apBills'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });

  return {
    // 7.8 Statements
    pnl: pnlQuery.data,
    isPnlLoading: pnlQuery.isLoading,
    balanceSheet: balanceSheetQuery.data,
    isBalanceSheetLoading: balanceSheetQuery.isLoading,
    cashFlow: cashFlowQuery.data,
    isCashFlowLoading: cashFlowQuery.isLoading,

    // 7.2 Audit
    auditStatus: auditStatusQuery.data,
    runNightAudit: runAuditMutation.mutateAsync,
    isRunningAudit: runAuditMutation.isPending,
    auditResult: runAuditMutation.data,

    // 7.1 COA & GL
    coaList: coaQuery.data || [],
    isCoaLoading: coaQuery.isLoading,
    journalsList: journalsQuery.data || [],
    isJournalsLoading: journalsQuery.isLoading,
    createAccount: createAccountMutation.mutateAsync,
    createJournal: createJournalMutation.mutateAsync,

    // 7.7 Budgeting
    budgetVariance: budgetVarianceQuery.data,
    isBudgetLoading: budgetVarianceQuery.isLoading,
    budgetsList: budgetsQuery.data || [],
    createBudget: createBudgetMutation.mutateAsync,

    // 7.5 Multi-Bank & Cash Registers
    bankAccounts: bankAccountsQuery.data || [],
    isBanksLoading: bankAccountsQuery.isLoading,
    cashRegisters: cashRegistersQuery.data || [],
    activeShift: activeShiftQuery.data,
    transferFunds: transferFundsMutation.mutateAsync,
    openRegisterShift: openShiftMutation.mutateAsync,
    closeRegisterShift: closeShiftMutation.mutateAsync,

    // 7.3 AR Aging
    agingReport: agingQuery.data,
    isAgingLoading: agingQuery.isLoading,

    // 7.4 AP Bills
    billsList: billsQuery.data || [],
    isBillsLoading: billsQuery.isLoading,
    performThreeWayMatch: matchVoucherMutation.mutateAsync,
    approveBillPayment: approveBillMutation.mutateAsync,
  };
}
