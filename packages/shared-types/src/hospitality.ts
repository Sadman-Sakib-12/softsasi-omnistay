export interface HotelSummary {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  timezone: string;
  currency: string;
  propertyType: string;
  starRating?: number;
  status: string;
}

export interface TapeChartReservationCell {
  bookingId: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'confirmed' | 'checked_in' | 'due_out' | 'checked_out' | 'maintenance';
}

export interface RoomTapeChartRow {
  roomId: string;
  roomNumber: string;
  roomTypeTitle: string;
  cleanlinessStatus: 'clean' | 'dirty' | 'inspected';
  operationalStatus: 'available' | 'ooo' | 'oos';
  timeline: Record<string, TapeChartReservationCell | null>;
}

export interface Property {
  id: string;
  name: string;
  slug?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  status?: string;
  starRating?: number;
  author?: string;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  roomNumber?: string;
  roomType?: string;
  pricePerNight?: number;
  basePrice?: number;
  numberOfBeds?: number;
  minStay?: number;
  maxStay?: number;
  status?: string;
  propertyId?: string;
  createdAt: string;
}

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
