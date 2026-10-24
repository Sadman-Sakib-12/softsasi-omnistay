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

  const runAuditMutation = useMutation({
    mutationFn: () => financeService.runNightAudit(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pnlReport'] });
      queryClient.invalidateQueries({ queryKey: ['auditStatus'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  return {
    pnl: pnlQuery.data,
    isPnlLoading: pnlQuery.isLoading,
    auditStatus: auditStatusQuery.data,
    runNightAudit: runAuditMutation.mutateAsync,
    isRunningAudit: runAuditMutation.isPending,
    auditResult: runAuditMutation.data,
  };
}
