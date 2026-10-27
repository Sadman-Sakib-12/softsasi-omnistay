import { api } from '@/lib/api/client';

export interface BanquetLead {
  id: string;
  clientName: string;
  eventType: string;
  eventDate: string;
  pax: number;
  estimatedBudget: number;
  stage: string;
  createdAt?: string;
}

export const crmService = {
  getLeads: async (): Promise<BanquetLead[]> => {
    try {
      const res = await api.get<any>('/api/v1/crm/leads');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((item: any) => ({
        id: item.id || `lead-${Date.now()}`,
        clientName: item.clientName || item.name || item.guestName || '',
        eventType: item.eventType || item.category || 'General',
        eventDate: item.eventDate || item.targetDate || '',
        pax: Number(item.pax || item.headcount || 0),
        estimatedBudget: Number(item.estimatedBudget || item.budget || 0),
        stage: item.stage || item.status || 'New',
      }));
    } catch (error) {
      return [];
    }
  },

  createLead: async (dto: Partial<BanquetLead>): Promise<any> => {
    return await api.post('/api/v1/crm/leads', dto);
  },
};
