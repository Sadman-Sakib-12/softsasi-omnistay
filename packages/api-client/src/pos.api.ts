import { apiClient, ApiClient } from './client.js';

export interface ChargeToRoomPayload {
  propertyId: string;
  roomNumber: string;
  amount: number;
  outletName: string;
  guestSignature?: string;
  receiptNumber?: string;
}

export function createPosApi(client: ApiClient = apiClient) {
  return {
    async getOutlets(): Promise<any[]> {
      try {
        const res = await client.get<any>('/api/v1/pos/outlets');
        return Array.isArray(res) ? res : res?.data || [];
      } catch {
        return [];
      }
    },

    async getOutletById(outletId: string): Promise<any> {
      try {
        return await client.get(`/api/v1/pos/outlets/${outletId}`);
      } catch {
        return null;
      }
    },

    async getKdsQueue(outletId: string): Promise<any[]> {
      try {
        return await client.get<any[]>(`/api/v1/pos/kds/${outletId}/queue`);
      } catch {
        return [];
      }
    },

    async updateTicketStatus(ticketId: string, status: string): Promise<any> {
      return client.patch(`/api/v1/pos/kds/tickets/${ticketId}/status`, { status });
    },

    async getStations(outletId: string): Promise<any[]> {
      try {
        return await client.get<any[]>(`/api/v1/pos/kds/${outletId}/stations`);
      } catch {
        return [];
      }
    },

    async verifyRoomForCharge(propertyId: string, roomNumber: string): Promise<any> {
      return client.get(`/api/v1/pos/room-charge/verify/${propertyId}/${roomNumber}`);
    },

    async chargeToRoom(payload: ChargeToRoomPayload): Promise<any> {
      return client.post('/api/v1/pos/room-charge/charge', payload);
    },
  };
}

export const posApi = createPosApi(apiClient);

