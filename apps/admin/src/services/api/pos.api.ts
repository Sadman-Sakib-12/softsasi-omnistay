import { apiClient } from './client';

export const posApi = {
  async getKdsQueue(outletId: string): Promise<any[]> {
    return apiClient.get(`/api/v1/pos/kds/${outletId}/queue`);
  },

  async updateTicketStatus(ticketId: string, status: string): Promise<any> {
    return apiClient.patch(`/api/v1/pos/kds/tickets/${ticketId}/status`, { status });
  },

  async getStations(outletId: string): Promise<any[]> {
    return apiClient.get(`/api/v1/pos/kds/${outletId}/stations`);
  },
};
