'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import { useTenantStore } from '@/stores/tenant-store';

export function useFinance() {
  const queryClient = useQueryClient();
  const { currentTenantId } = useTenantStore();

  const pnlQuery = useQuery({
    queryKey: ['pnlReport', currentTenantId],
    queryFn: () => financeService.getPnL(),
  });

  const auditStatusQuery = useQuery({
    queryKey: ['auditStatus', currentTenantId],
    queryFn: () => financeService.getAuditStatus(),
  });

  const coaQuery = useQuery({
    queryKey: ['chartOfAccounts', currentTenantId],
    queryFn: () => financeService.getChartOfAccounts(),
  });

  const journalsQuery = useQuery({
    queryKey: ['glJournals', currentTenantId],
    queryFn: () => financeService.getJournals(),
  });

  const runAuditMutation = useMutation({
    mutationFn: () => financeService.runNightAudit(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pnlReport'] });
      queryClient.invalidateQueries({ queryKey: ['auditStatus'] });
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['glJournals'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
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
    },
  });

  return {
    pnl: pnlQuery.data,
    isPnlLoading: pnlQuery.isLoading,
    auditStatus: auditStatusQuery.data,
    coaList: coaQuery.data || [],
    isCoaLoading: coaQuery.isLoading,
    journalsList: journalsQuery.data || [],
    isJournalsLoading: journalsQuery.isLoading,
    runNightAudit: runAuditMutation.mutateAsync,
    isRunningAudit: runAuditMutation.isPending,
    auditResult: runAuditMutation.data,
    createAccount: createAccountMutation.mutateAsync,
    isCreatingAccount: createAccountMutation.isPending,
    createJournal: createJournalMutation.mutateAsync,
    isCreatingJournal: createJournalMutation.isPending,
  };
}
