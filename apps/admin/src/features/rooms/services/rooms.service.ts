import { api } from '@/lib/api/client';

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

export interface CreateRoomDto {
  name: string;
  roomNumber?: string;
  roomType?: string;
  pricePerNight: number;
  numberOfBeds: number;
  minStay?: number;
  maxStay?: number;
  propertyId?: string;
}

export const roomsService = {
  getAll: async (propertyId?: string): Promise<Room[]> => {
    const res = await api.get<any>('/api/v1/rooms', {
      params: propertyId ? { propertyId } : undefined,
    });
    return Array.isArray(res) ? res : res?.data || [];
  },

  create: async (dto: CreateRoomDto): Promise<Room> => {
    return await api.post<Room>('/api/v1/rooms', dto);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/rooms/${id}`);
  },

  update: async (id: string, dto: Partial<CreateRoomDto>): Promise<Room> => {
    return await api.patch<Room>(`/api/v1/rooms/${id}`, dto);
  },
};
