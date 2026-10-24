export interface Tenant {
  id: string;
  name: string;
  domain?: string | null;
  subdomain?: string | null;
  createdAt?: string;
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  status?: string;
  createdAt: string;
}
