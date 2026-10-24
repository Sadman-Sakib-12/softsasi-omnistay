import { apiClient } from './client';

export interface PropertyDto {
  id?: string;
  name: string;
  code: string;
  propertyType?: string;
  starRating?: number;
  address?: string;
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

export const pmsApi = {
  async listProperties(organizationId?: string): Promise<PropertyDto[]> {
    return apiClient.get('/api/v1/properties', { organizationId });
  },

  async getProperty(id: string): Promise<PropertyDto> {
    return apiClient.get(`/api/v1/properties/${id}`);
  },

  async createProperty(data: PropertyDto): Promise<PropertyDto> {
    return apiClient.post('/api/v1/properties', data);
  },

  async updateProperty(id: string, data: Partial<PropertyDto>): Promise<PropertyDto> {
    return apiClient.patch(`/api/v1/properties/${id}`, data);
  },

  async deleteProperty(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/properties/${id}`);
  },

  async getTapeChart(params?: { propertyId?: string; startDate?: string; days?: number }): Promise<any> {
    return apiClient.get('/api/v1/rooms/tape-chart', params);
  },

  async listBookings(params?: { propertyId?: string; bookingStatus?: string; guestId?: string }): Promise<any[]> {
    return apiClient.get('/api/v1/bookings', params);
  },

  async getBooking(id: string): Promise<any> {
    return apiClient.get(`/api/v1/bookings/${id}`);
  },

  async createBooking(data: CreateBookingDto): Promise<any> {
    return apiClient.post('/api/v1/bookings', data);
  },

  async checkInGuest(data: CheckInDto): Promise<any> {
    return apiClient.post('/api/v1/rooms/check-in', data);
  },

  async checkOutGuest(data: CheckOutDto): Promise<any> {
    return apiClient.post('/api/v1/rooms/check-out', data);
  },
};
