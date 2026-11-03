import { api } from '@/lib/api/client';

export interface Reservation {
  id: string;
  confirmationCode?: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  roomId?: string;
  roomName?: string;
  createdAt: string;
}

export interface CreateReservationDto {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  roomId?: string;
  propertyId?: string;
}

export const reservationsService = {
  getAll: async (): Promise<Reservation[]> => {
    const res = await api.get<any>('/api/v1/bookings');
    return Array.isArray(res) ? res : res?.data || [];
  },

  getById: async (id: string): Promise<Reservation> => {
    return await api.get<Reservation>(`/api/v1/bookings/${id}`);
  },

  create: async (dto: CreateReservationDto): Promise<Reservation> => {
    return await api.post<Reservation>('/api/v1/bookings', dto);
  },

  checkIn: async (params: {
    bookingId: string;
    roomId?: string;
    keycardCode?: string;
    digitalSignature?: string;
  } | string): Promise<{ success: boolean; message: string }> => {
    const payload = typeof params === 'string' ? { bookingId: params } : params;
    return await api.post<{ success: boolean; message: string }>('/api/v1/rooms/check-in', payload);
  },

  parsePassportOcr: async (data: {
    imageBase64?: string;
    rawText?: string;
    mrzLines?: string[];
  }): Promise<any> => {
    return await api.post('/api/v1/hotel/ocr/passport', data);
  },

  checkOut: async (bookingId: string): Promise<{ success: boolean; message: string }> => {
    return await api.post<{ success: boolean; message: string }>('/api/v1/rooms/check-out', {
      bookingId,
    });
  },

  getTapeChart: async (startDate: string, endDate: string): Promise<any> => {
    return await api.get('/api/v1/rooms/tape-chart', {
      params: { startDate, endDate },
    });
  },
};
