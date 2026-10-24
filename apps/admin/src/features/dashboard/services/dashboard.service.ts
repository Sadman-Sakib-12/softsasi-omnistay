import { propertiesService } from '@/features/properties/services/properties.service';
import { roomsService } from '@/features/rooms/services/rooms.service';
import { reservationsService } from '@/features/reservations/services/reservations.service';
import { financeService } from '@/features/finance/services/finance.service';

export interface DashboardMetrics {
  totalProperties: number;
  totalRooms: number;
  totalReservations: number;
  totalRevenue: number;
}

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const [properties, rooms, reservations, pnl] = await Promise.all([
      propertiesService.getAll().catch(() => []),
      roomsService.getAll().catch(() => []),
      reservationsService.getAll().catch(() => []),
      financeService.getPnL().catch(() => ({ totalRevenue: 0 })),
    ]);

    return {
      totalProperties: properties.length,
      totalRooms: rooms.length,
      totalReservations: reservations.length,
      totalRevenue: pnl.totalRevenue || 0,
    };
  },
};
