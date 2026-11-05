import { api } from '@/lib/api/client';

export interface LeadCallLogItem {
  id: string;
  callSubject: string;
  callDuration: number;
  notes?: string;
  loggedAt: string;
}

export interface LeadNoteItem {
  id: string;
  noteContent: string;
  createdBy?: string;
  createdAt: string;
}

export interface LeadStageItem {
  id: string;
  name: string;
  displayOrder: number;
}

export interface LeadItem {
  id: string;
  title: string;
  contactName: string;
  email?: string;
  phone?: string;
  leadScore: number;
  source: string;
  assignedTo?: string;
  stageId?: string;
  stage?: LeadStageItem;
  callLogs?: LeadCallLogItem[];
  notes?: LeadNoteItem[];
  createdAt: string;
}

export interface DealProposalItem {
  id: string;
  dealId: string;
  proposalRef: string;
  pdfUrl?: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface ContractSignatureItem {
  id: string;
  signerName: string;
  signerIp: string;
  signatureImg: string;
  signedAt: string;
}

export interface BanquetContractItem {
  id: string;
  dealId: string;
  contractNumber: string;
  termsContent: string;
  isSigned: boolean;
  signatures?: ContractSignatureItem[];
  createdAt: string;
}

export interface DealStageItem {
  id: string;
  name: string;
  displayOrder: number;
}

export interface DealItem {
  id: string;
  dealName: string;
  dealValue: number;
  expectedClose?: string;
  status: string;
  stageId?: string;
  stage?: DealStageItem;
  proposals?: DealProposalItem[];
  contracts?: BanquetContractItem[];
  createdAt: string;
}

export interface GuestStayPreferenceItem {
  id: string;
  preferenceKey: string;
  preferenceVal: string;
}

export interface GuestDietaryRestrictionItem {
  id: string;
  restriction: string;
  notes?: string;
}

export interface Guest360Item {
  id: string;
  userId: string;
  lifetimeSpend: number;
  totalNights: number;
  vipTier: 'Silver' | 'Gold' | 'Platinum' | 'VIP Black' | string;
  notes?: string;
  preferences?: GuestStayPreferenceItem[];
  dietary?: GuestDietaryRestrictionItem[];
  createdAt: string;
}

export interface FormBuilderItem {
  id: string;
  formName: string;
  formSchema: {
    title?: string;
    description?: string;
    fields: Array<{
      id: string;
      name: string;
      label: string;
      type: string;
      required: boolean;
      placeholder?: string;
      options?: string[];
    }>;
  };
  isActive: boolean;
  createdAt: string;
  _count?: {
    responses: number;
  };
}

export interface SupportTicketReplyItem {
  id: string;
  senderType: 'guest' | 'staff' | string;
  message: string;
  createdAt: string;
}

export interface SupportTicketItem {
  id: string;
  ticketCode: string;
  guestName: string;
  guestEmail?: string;
  subject: string;
  priority: 'urgent' | 'high' | 'normal' | 'low' | string;
  status: 'open' | 'in_progress' | 'resolved' | string;
  replies?: SupportTicketReplyItem[];
  createdAt: string;
}

export interface CannedResponseItem {
  id: string;
  shortcut: string;
  title: string;
  response: string;
}

export interface KnowledgeBaseItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

// Backward compatibility interfaces
export type BanquetLead = LeadItem;
export type BanquetDeal = DealItem;

export const crmService = {
  // 11.1 Omnichannel Leads
  getLeads: async (): Promise<LeadItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/crm/leads');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data;
    } catch {
      return [];
    }
  },

  getLeadStages: async (): Promise<LeadStageItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/crm/leads/stages');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createLead: async (dto: Partial<LeadItem>): Promise<any> => {
    return await api.post('/api/v1/crm/leads', dto);
  },

  addCallLog: async (leadId: string, dto: { callSubject: string; callDuration: number; notes?: string }) => {
    return await api.post(`/api/v1/crm/leads/${leadId}/calls`, dto);
  },

  addNote: async (leadId: string, dto: { noteContent: string }) => {
    return await api.post(`/api/v1/crm/leads/${leadId}/notes`, dto);
  },

  // 11.2 Deal Pipelines & Banquet Sales Kanban
  getDeals: async (): Promise<DealItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/crm/deals');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getDealStages: async (): Promise<DealStageItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/crm/deals/stages');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createDeal: async (dto: any): Promise<any> => {
    return await api.post('/api/v1/crm/deals', dto);
  },

  createProposal: async (dealId: string, dto: { proposalRef: string; amount: number; pdfUrl?: string }) => {
    return await api.post(`/api/v1/crm/deals/${dealId}/proposals`, dto);
  },

  createContract: async (dealId: string, dto: { contractNumber: string; termsContent: string }) => {
    return await api.post(`/api/v1/crm/deals/${dealId}/contracts`, dto);
  },

  signContract: async (contractId: string, dto: { signerName: string; signatureImg: string }) => {
    return await api.post(`/api/v1/crm/deals/contracts/${contractId}/sign`, dto);
  },

  // 11.3 Guest 360 & Personalization Ledger
  getGuestProfiles: async (): Promise<Guest360Item[]> => {
    try {
      const res = await api.get<any>('/api/v1/crm/guests');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getGuestProfile: async (userId: string): Promise<Guest360Item | null> => {
    try {
      const res = await api.get<any>(`/api/v1/crm/guests/${userId}`);
      return res?.data || res || null;
    } catch {
      return null;
    }
  },

  addGuestPreference: async (userId: string, dto: { preferenceKey: string; preferenceVal: string }) => {
    return await api.post(`/api/v1/crm/guests/${userId}/preferences`, dto);
  },

  addGuestDietary: async (userId: string, dto: { restriction: string; notes?: string }) => {
    return await api.post(`/api/v1/crm/guests/${userId}/dietary`, dto);
  },

  // 11.4 Drag-and-Drop Form Builder & Submissions
  getForms: async (): Promise<FormBuilderItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/crm/forms');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createForm: async (dto: Partial<FormBuilderItem>) => {
    return await api.post('/api/v1/crm/forms', dto);
  },

  submitFormResponse: async (formId: string, formData: Record<string, any>) => {
    return await api.post(`/api/v1/crm/forms/${formId}/submit`, { formData });
  },

  // 11.5 Customer Support Ticketing & Guest Care Desk
  getTickets: async (): Promise<SupportTicketItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/crm/support/tickets');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createTicket: async (dto: { guestName: string; guestEmail?: string; subject: string; priority?: string }) => {
    return await api.post('/api/v1/crm/support/tickets', dto);
  },

  replyTicket: async (ticketId: string, dto: { message: string; senderType?: string }) => {
    return await api.post(`/api/v1/crm/support/tickets/${ticketId}/replies`, {
      senderType: dto.senderType || 'staff',
      message: dto.message,
    });
  },

  updateTicketStatus: async (ticketId: string, status: string) => {
    return await api.patch(`/api/v1/crm/support/tickets/${ticketId}/status`, { status });
  },

  getCannedResponses: async (): Promise<CannedResponseItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/crm/support/canned-responses');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getKnowledgeBase: async (category?: string): Promise<KnowledgeBaseItem[]> => {
    try {
      const url = category ? `/api/v1/crm/support/knowledge-base?category=${encodeURIComponent(category)}` : '/api/v1/crm/support/knowledge-base';
      const res = await api.get<any>(url);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },
};
