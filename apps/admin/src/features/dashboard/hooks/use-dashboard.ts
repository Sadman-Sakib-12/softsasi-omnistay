'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { useTenantStore } from '@/stores/tenant-store';

export function useDashboard() {
  const { currentTenantId } = useTenantStore();

  const metricsQuery = useQuery({
    queryKey: ['dashboardMetrics', currentTenantId],
    queryFn: () => dashboardService.getMetrics(),
  });

  return {
    metrics: metricsQuery.data || {
      totalProperties: 0,
      totalRooms: 0,
      totalReservations: 0,
      totalRevenue: 0,
    },
    isLoading: metricsQuery.isLoading,
    refetch: metricsQuery.refetch,
  };
}
