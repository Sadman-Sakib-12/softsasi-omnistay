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

export interface BanquetDeal {
  id: string;
  title: string;
  client: string;
  amount: number;
  stage: 'INQUIRY' | 'PROPOSAL_SENT' | 'CONTRACT_NEGOTIATION' | 'WON' | 'LOST' | string;
  date: string;
  pax: number;
  hall: string;
  probability: string;
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
    } catch {
      return [];
    }
  },

  createLead: async (dto: Partial<BanquetLead>): Promise<any> => {
    return await api.post('/api/v1/crm/leads', dto);
  },

  getDeals: async (): Promise<BanquetDeal[]> => {
    try {
      const res = await api.get<any>('/api/v1/crm/deals');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((item: any) => ({
        id: item.id || `dl-${Date.now()}`,
        title: item.title || item.dealName || 'Banquet Event',
        client: item.clientName || item.client || 'Corporate Client',
        amount: Number(item.amount || item.value || 0),
        stage: (item.stage || 'INQUIRY').toUpperCase(),
        date: item.eventDate || item.date || new Date().toISOString().split('T')[0],
        pax: Number(item.pax || 100),
        hall: item.hallName || item.hall || 'Grand Ballroom',
        probability: item.probability || '60%',
      }));
    } catch {
      return [];
    }
  },

  createDeal: async (dto: any): Promise<any> => {
    return await api.post('/api/v1/crm/deals', dto);
  },

  getGuestProfiles: async (): Promise<any[]> => {
    try {
      const res = await api.get<any>('/api/v1/crm/guest360');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },
};
