import { api } from '@/lib/api/client';

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

export interface CreatePropertyDto {
  name: string;
  slug?: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  starRating?: number;
}

export const propertiesService = {
  getAll: async (): Promise<Property[]> => {
    const res = await api.get<any>('/api/v1/properties');
    return Array.isArray(res) ? res : res?.data || [];
  },

  getById: async (id: string): Promise<Property> => {
    return await api.get<Property>(`/api/v1/properties/${id}`);
  },

  create: async (dto: CreatePropertyDto): Promise<Property> => {
    return await api.post<Property>('/api/v1/properties', dto);
  },

  update: async (id: string, dto: Partial<CreatePropertyDto>): Promise<Property> => {
    return await api.patch<Property>(`/api/v1/properties/${id}`, dto);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/properties/${id}`);
  },
};
