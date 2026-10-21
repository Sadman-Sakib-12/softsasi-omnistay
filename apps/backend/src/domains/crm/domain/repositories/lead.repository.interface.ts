export const LEAD_REPOSITORY_TOKEN = Symbol('ILeadRepository');

export interface ILeadRepository {
  createStage(data: { tenantId: string; name: string; displayOrder: number }): Promise<any>;
  findStages(tenantId: string): Promise<any[]>;
  findFirstStage(tenantId: string): Promise<any | null>;
  createLead(data: {
    tenantId: string;
    stageId?: string;
    title: string;
    contactName: string;
    email?: string;
    phone?: string;
    leadScore: number;
    source: string;
    assignedTo?: string;
  }): Promise<any>;
  findLeads(tenantId: string): Promise<any[]>;
  findLeadById(id: string): Promise<any | null>;
  countOpenLeadsForUser(tenantId: string, userId: string): Promise<number>;
  updateLead(id: string, data: Record<string, any>): Promise<any>;
  addCallLog(data: { leadId: string; callSubject: string; callDuration: number; notes?: string }): Promise<any>;
  addNote(data: { leadId: string; createdBy?: string; noteContent: string }): Promise<any>;
}
