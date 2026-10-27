import { api } from '@/lib/api/client';

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  subdomain?: string;
  domain?: string;
  planId?: string;
  status?: string;
  createdAt?: string;
}

export const organizationsService = {
  getAll: async (): Promise<Organization[]> => {
    try {
      const res = await api.get<any>('/api/v1/organizations');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((org: any) => ({
        id: org.id || org.organizationId || org._id,
        name: org.name,
        slug: org.slug,
        subdomain: org.slug || org.subdomain,
        domain: org.domain || (org.slug ? `${org.slug}.omnistay.com` : ''),
        planId: org.planId || '',
        status: org.status || 'ACTIVE',
        createdAt: org.createdAt || '',
      }));
    } catch (error) {
      return [];
    }
  },

  getById: async (id: string): Promise<Organization> => {
    return await api.get<Organization>(`/api/v1/organizations/${id}`);
  },

  create: async (dto: { name: string; slug: string }): Promise<Organization> => {
    return await api.post<Organization>('/api/v1/organizations', dto);
  },
};
