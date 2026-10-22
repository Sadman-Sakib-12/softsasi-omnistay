export const AI_REPOSITORY_TOKEN = Symbol('IAiRepository');

export interface IAiRepository {
  findConfigByTenantId(tenantId: string): Promise<any | null>;
  upsertConfig(tenantId: string, data: any): Promise<any>;

  findConversationBySession(sessionId: string): Promise<any | null>;
  createConversation(data: any): Promise<any>;
  addConversationMessage(data: any): Promise<any>;
  getConversationMessages(conversationId: string): Promise<any[]>;

  createKnowledgeDocument(data: any): Promise<any>;
  findKnowledgeDocuments(tenantId: string, category?: string): Promise<any[]>;
  searchKnowledgeDocuments(tenantId: string, query: string): Promise<any[]>;

  createInChatTransaction(data: any): Promise<any>;
  updateInChatTransaction(id: string, data: any): Promise<any>;
  findInChatTransaction(id: string): Promise<any | null>;

  createDynamicPricingLog(data: any): Promise<any>;
  findDynamicPricingLogs(roomTypeId: string, limit?: number): Promise<any[]>;

  createMarketingCampaign(data: any): Promise<any>;
  findMarketingCampaigns(tenantId: string): Promise<any[]>;

  createPredictiveForecast(data: any): Promise<any>;
  findPredictiveForecasts(propertyId: string): Promise<any[]>;

  createCompetitorPriceScrape(data: any): Promise<any>;
  findCompetitorPriceScrapes(propertyId: string): Promise<any[]>;
}
