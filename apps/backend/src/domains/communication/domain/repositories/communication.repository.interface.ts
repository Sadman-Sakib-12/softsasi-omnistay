export const COMMUNICATION_REPOSITORY_TOKEN = Symbol('ICommunicationRepository');

export interface ICommunicationRepository {
  createChatMessage(data: any): Promise<any>;
  findChatMessagesBetween(userId1: string, userId2: string, limit?: number): Promise<any[]>;
  findChannelMessages(channelId: string, limit?: number): Promise<any[]>;
  markMessagesAsSeen(messageIds: string[]): Promise<any>;

  createChannel(data: any): Promise<any>;
  findChannels(tenantId: string): Promise<any[]>;
  addChannelMember(channelId: string, userId: string, role?: string): Promise<any>;
  getChannelMembers(channelId: string): Promise<any[]>;

  createWhatsappMessage(data: any): Promise<any>;
  findWhatsappMessages(tenantId: string): Promise<any[]>;
  createWhatsappTemplate(data: any): Promise<any>;
  findWhatsappTemplateByName(name: string): Promise<any | null>;

  createSmsLog(data: any): Promise<any>;
  findSmsLogs(phoneTo?: string): Promise<any[]>;
  upsertSmsGateway(gatewayKey: string, data: any): Promise<any>;
  findActiveSmsGateway(): Promise<any | null>;

  createEmailTemplate(data: any): Promise<any>;
  findEmailTemplateByName(name: string): Promise<any | null>;
  findEmailTemplates(): Promise<any[]>;

  createEmailCampaign(data: any): Promise<any>;
  findEmailCampaigns(tenantId: string): Promise<any[]>;

  createEmailLog(data: any): Promise<any>;
  findEmailLogs(recipient?: string): Promise<any[]>;

  upsertPushSubscription(userId: string, data: any): Promise<any>;
  createPushNotification(data: any): Promise<any>;
  findPushNotifications(userId: string): Promise<any[]>;
  markPushNotificationAsRead(id: string): Promise<any>;
}
