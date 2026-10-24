import { api } from '@/lib/api/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  status?: string;
  createdAt: string;
}

export interface InviteUserDto {
  email: string;
  name: string;
  role: string;
}

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const res = await api.get<any>('/api/v1/users');
    return Array.isArray(res) ? res : res?.data || [];
  },

  getById: async (id: string): Promise<User> => {
    return await api.get<User>(`/api/v1/users/${id}`);
  },

  invite: async (dto: InviteUserDto): Promise<User> => {
    return await api.post<User>('/api/v1/users/invite', dto);
  },
};
