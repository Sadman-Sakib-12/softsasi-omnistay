import { api } from '@/lib/api/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  status?: string;
  temporaryPassword?: string;
  createdAt: string;
}

export interface InviteUserDto {
  email: string;
  name: string;
  role: string;
  password?: string;
  organizationId?: string;
}

export const usersService = {
  getAll: async (orgId?: string): Promise<User[]> => {
    const validOrgId = orgId && orgId !== 'all' ? orgId : undefined;
    const res = await api.get<any>('/api/v1/users', {
      params: validOrgId ? { organizationId: validOrgId } : undefined,
    });
    return Array.isArray(res) ? res : res?.data || [];
  },

  getById: async (id: string): Promise<User> => {
    return await api.get<User>(`/api/v1/users/${id}`);
  },

  invite: async (dto: InviteUserDto): Promise<User> => {
    const validOrgId = dto.organizationId && dto.organizationId !== 'all' ? dto.organizationId : undefined;
    const cleanDto = { ...dto, organizationId: validOrgId };
    try {
      return await api.post<User>('/api/v1/users/invite', cleanDto, {
        params: validOrgId ? { organizationId: validOrgId } : undefined,
      });
    } catch {
      return await api.post<User>('/api/v1/users', cleanDto, {
        params: validOrgId ? { organizationId: validOrgId } : undefined,
      });
    }
  },

  update: async (id: string, dto: Partial<User>): Promise<User> => {
    return await api.patch<User>(`/api/v1/users/${id}`, dto);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/users/${id}`);
  },
};
