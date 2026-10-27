import { apiClient, ApiClient } from './client.js';

export interface PropertyDto {
  id?: string;
  name: string;
  code: string;
  propertyType?: string;
  starRating?: number;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: string;
  lat?: number;
  lng?: number;
}

export interface CreateBookingDto {
  propertyId: string;
  roomTypeId?: string;
  guestId?: string;
  guestName?: string;
  guestEmail?: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children?: number;
  totalAmount: number;
  depositAmount?: number;
}

export interface CheckInDto {
  bookingId: string;
  roomNumber: string;
  idScanData?: string;
  keycardCode?: string;
}

export interface CheckOutDto {
  bookingId: string;
  folioSettled: boolean;
  settlementMethod?: string;
}

export function createPmsApi(client: ApiClient = apiClient) {
  return {
    async listProperties(params?: Record<string, any>): Promise<PropertyDto[]> {
      const res = await client.get<any>('/api/v1/properties', params);
      return Array.isArray(res) ? res : res?.data || [];
    },

    async getProperty(id: string): Promise<PropertyDto> {
      return client.get(`/api/v1/properties/${id}`);
    },

    async createProperty(data: PropertyDto): Promise<PropertyDto> {
      return client.post('/api/v1/properties', data);
    },

    async updateProperty(id: string, data: Partial<PropertyDto>): Promise<PropertyDto> {
      return client.patch(`/api/v1/properties/${id}`, data);
    },

    async deleteProperty(id: string): Promise<void> {
      return client.delete(`/api/v1/properties/${id}`);
    },

    async getTapeChart(params?: { propertyId?: string; startDate?: string; days?: number }): Promise<any> {
      return client.get('/api/v1/rooms/tape-chart', params);
    },

    async listBookings(params?: { propertyId?: string; bookingStatus?: string; guestId?: string }): Promise<any[]> {
      return client.get('/api/v1/bookings', params);
    },

    async getBooking(id: string): Promise<any> {
      return client.get(`/api/v1/bookings/${id}`);
    },

    async createBooking(data: CreateBookingDto): Promise<any> {
      return client.post('/api/v1/bookings', data);
    },

    async checkInGuest(data: CheckInDto): Promise<any> {
      return client.post('/api/v1/rooms/check-in', data);
    },

    async checkOutGuest(data: CheckOutDto): Promise<any> {
      return client.post('/api/v1/rooms/check-out', data);
    },
  };
}

export const pmsApi = createPmsApi(apiClient);

