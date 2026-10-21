export const SUPPORT_REPOSITORY_TOKEN = Symbol('ISupportRepository');

export interface ISupportRepository {
  countTickets(tenantId: string): Promise<number>;
  createTicket(data: {
    tenantId: string;
    ticketCode: string;
    guestName: string;
    guestEmail?: string;
    subject: string;
    priority: string;
    status: string;
  }): Promise<any>;
  findTickets(tenantId: string): Promise<any[]>;
  findTicketById(id: string): Promise<any | null>;
  addReply(data: { ticketId: string; senderType: string; message: string }): Promise<any>;
  updateTicket(id: string, data: Record<string, any>): Promise<any>;
  createCannedResponse(data: { shortcut: string; title: string; response: string }): Promise<any>;
  findCannedResponses(): Promise<any[]>;
  createKnowledgeBase(data: { category: string; question: string; answer: string }): Promise<any>;
  findKnowledgeBase(category?: string): Promise<any[]>;
}
