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
    try {
      const target = propertyId || 'STANFORD-01';
      const res = await api.get<any>(`/api/v1/properties/${target}/room-types`);
      const data = Array.isArray(res) ? res : res?.data || [];
      if (data.length > 0) {
        return data
          .filter((rt: any) => (rt._count?.rooms ?? 1) > 0)
          .map((rt: any) => ({
            id: rt.id,
            name: rt.title,
            roomNumber: rt.slug,
            pricePerNight: Number(rt.basePrice || 350),
            basePrice: Number(rt.basePrice || 350),
            numberOfBeds: rt._count?.rooms ?? rt.maxAdults ?? 5,
            minStay: 2,
            status: 'Publish',
            propertyId: rt.propertyId,
            createdAt: rt.createdAt || '12/13/2025',
          }));
      }
    } catch {
      // Fallback to /api/v1/rooms if needed
    }
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
