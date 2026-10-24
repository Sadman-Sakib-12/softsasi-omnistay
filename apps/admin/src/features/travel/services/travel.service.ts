import { api } from '@/lib/api/client';

export interface TourItem {
  id: string;
  title: string;
  slug?: string;
  duration?: string;
  minPax?: number;
  maxPax?: number;
  price: number;
  status?: string;
  category?: string;
  createdAt?: string;
}

export interface SpaceItem {
  id: string;
  name: string;
  category?: string;
  capacity?: number;
  areaSqFt?: number;
  hourlyRate: number;
  dailyRate?: number;
  status?: string;
}

export interface CarItem {
  id: string;
  model: string;
  category?: string;
  seats?: number;
  dailyRate: number;
  transmission?: string;
  fuelType?: string;
  status?: string;
}

export interface BoatItem {
  id: string;
  name: string;
  vesselType?: string;
  capacity?: number;
  lengthFt?: number;
  hourlyRate: number;
  status?: string;
}

export interface EventItem {
  id: string;
  title: string;
  eventType?: string;
  startDate?: string;
  venue?: string;
  ticketPrice: number;
  totalTickets?: number;
  status?: string;
}

export interface FlightItem {
  id: string;
  flightNumber: string;
  aircraft?: string;
  origin: string;
  destination: string;
  seatPrice: number;
  status?: string;
}

export const travelService = {
  // Tours
  getTours: async (): Promise<TourItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/tours');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },
  createTour: async (dto: any) => {
    return await api.post('/api/v1/tours', dto);
  },

  // Spaces
  getSpaces: async (): Promise<SpaceItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/spaces');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },
  createSpace: async (dto: any) => {
    return await api.post('/api/v1/spaces', dto);
  },

  // Cars
  getCars: async (): Promise<CarItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/cars');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },
  createCar: async (dto: any) => {
    return await api.post('/api/v1/cars', dto);
  },

  // Boats
  getBoats: async (): Promise<BoatItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/boats');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },
  createBoat: async (dto: any) => {
    return await api.post('/api/v1/boats', dto);
  },

  // Events
  getEvents: async (): Promise<EventItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/events');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },
  createEvent: async (dto: any) => {
    return await api.post('/api/v1/events', dto);
  },

  // Flights
  getFlights: async (): Promise<FlightItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/flights');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },
  createFlight: async (dto: any) => {
    return await api.post('/api/v1/flights', dto);
  },
};
