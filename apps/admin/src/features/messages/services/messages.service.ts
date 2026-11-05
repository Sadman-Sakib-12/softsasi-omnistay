import { api } from '@/lib/api/client';

export interface ChatAttachment {
  type: 'image/jpeg' | 'audio/webm' | 'application/pdf' | string;
  url: string;
  caption?: string;
  durationSec?: number;
}

export interface ChatMessageItem {
  id: string;
  fromId: string;
  toId?: string;
  channelId?: string;
  body: string;
  attachment?: string | ChatAttachment;
  isSeen: boolean;
  createdAt: string;
  senderName?: string;
  isStaff?: boolean;
}

export interface ChatChannelItem {
  id: string;
  tenantId?: string;
  channelName: string;
  isPrivate: boolean;
  createdAt?: string;
  members?: any[];
}

export interface WhatsappMessageItem {
  id: string;
  tenantId: string;
  recipientNo: string;
  messageBody: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
}

export interface SmsGatewayItem {
  id: string;
  gatewayKey: string;
  apiKey: string;
  apiSecret?: string;
  senderId?: string;
  isActive: boolean;
}

export interface SmsLogItem {
  id: string;
  phoneTo: string;
  message: string;
  gateway: string;
  status: string;
  cost: number;
  sentAt: string;
}

export interface EmailTemplateItem {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  mergeTags: string[];
  createdAt?: string;
}

export interface EmailCampaignItem {
  id: string;
  tenantId: string;
  campaignName: string;
  subject: string;
  recipientCount: number;
  sentCount: number;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  scheduledAt?: string;
  createdAt: string;
}

export interface PushNotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface CommunicationOverviewData {
  channels: ChatChannelItem[];
  whatsapp: {
    messages: WhatsappMessageItem[];
    totalMessages: number;
    inboundCount: number;
    outboundCount: number;
  };
  sms: {
    gateways: SmsGatewayItem[];
    activeGateways: number;
    logs: SmsLogItem[];
    totalCost: number;
    successRate: number;
  };
  email: {
    templates: EmailTemplateItem[];
    campaigns: EmailCampaignItem[];
    totalRecipients: number;
    totalSent: number;
  };
  push: {
    notifications: PushNotificationItem[];
    unreadCount: number;
  };
  summary: {
    totalChannels: number;
    activeWhatsappChats: number;
    smsGatewaysCount: number;
    emailTemplatesCount: number;
    emailCampaignsCount: number;
    pushNotificationsCount: number;
  };
}

export const messagesService = {
  // Enterprise Overview
  getOverview: async (): Promise<CommunicationOverviewData> => {
    try {
      const res = await api.get<any>('/api/v1/communications/chat/overview');
      return res?.data || res;
    } catch (err) {
      console.error('Failed to load communication overview', err);
      return {
        channels: [],
        whatsapp: { messages: [], totalMessages: 0, inboundCount: 0, outboundCount: 0 },
        sms: { gateways: [], activeGateways: 0, logs: [], totalCost: 0, successRate: 100 },
        email: { templates: [], campaigns: [], totalRecipients: 0, totalSent: 0 },
        push: { notifications: [], unreadCount: 0 },
        summary: { totalChannels: 0, activeWhatsappChats: 0, smsGatewaysCount: 0, emailTemplatesCount: 0, emailCampaignsCount: 0, pushNotificationsCount: 0 },
      };
    }
  },

  // 17.1 Chat & Channels
  getChannels: async (): Promise<ChatChannelItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/communications/chat/channels');
      return Array.isArray(res) ? res : res?.data || [];
    } catch (error) {
      return [];
    }
  },

  createChannel: async (dto: { channelName: string; isPrivate?: boolean }): Promise<ChatChannelItem> => {
    const res = await api.post<any>('/api/v1/communications/chat/channels', dto);
    return res?.data || res;
  },

  getMessages: async (channelId: string): Promise<ChatMessageItem[]> => {
    try {
      const res = await api.get<any>(`/api/v1/communications/chat/channels/${channelId}/messages`);
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((m: any) => {
        let parsedAttachment: any = null;
        if (m.attachment) {
          try {
            parsedAttachment = JSON.parse(m.attachment);
          } catch {
            parsedAttachment = { type: 'file', url: m.attachment };
          }
        }
        return {
          id: m.id,
          fromId: m.fromId,
          toId: m.toId,
          channelId: m.channelId,
          body: m.body,
          attachment: parsedAttachment,
          isSeen: !!m.isSeen,
          createdAt: m.createdAt,
          senderName: m.fromId === '00000000-0000-4000-a000-000000000003' ? 'Guest (David Vance)' : 'Front Desk Reception',
          isStaff: m.fromId !== '00000000-0000-4000-a000-000000000003',
        };
      });
    } catch (error) {
      return [];
    }
  },

  sendMessage: async (dto: { channelId?: string; toId?: string; body: string; attachment?: string }): Promise<ChatMessageItem> => {
    const res = await api.post<any>('/api/v1/communications/chat/messages', dto);
    return res?.data || res;
  },

  // 17.2 WhatsApp Business API
  getWhatsappMessages: async (): Promise<WhatsappMessageItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/communications/whatsapp/messages');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  sendWhatsappMessage: async (dto: { recipientNo: string; customMessage: string }): Promise<any> => {
    const res = await api.post<any>('/api/v1/communications/whatsapp/send', dto);
    return res?.data || res;
  },

  // 17.3 SMS Gateways
  getSmsGateways: async (): Promise<SmsGatewayItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/communications/sms/gateways');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getSmsLogs: async (): Promise<SmsLogItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/communications/sms/logs');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  sendSms: async (dto: { phoneTo: string; message: string; gateway?: string; isCriticalOtp?: boolean }): Promise<any> => {
    const res = await api.post<any>('/api/v1/communications/sms/send', dto);
    return res?.data || res;
  },

  // 17.4 Email Templates & Campaigns
  getEmailTemplates: async (): Promise<EmailTemplateItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/communications/email/templates');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  sendTestEmail: async (dto: { recipient: string; subject: string; htmlBody: string }): Promise<any> => {
    const res = await api.post<any>('/api/v1/communications/email/send', dto);
    return res?.data || res;
  },

  getEmailCampaigns: async (): Promise<EmailCampaignItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/communications/email/campaigns');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createEmailCampaign: async (dto: { campaignName: string; subject: string; recipientCount?: number; scheduledAt?: string }): Promise<any> => {
    const res = await api.post<any>('/api/v1/communications/email/campaigns', dto);
    return res?.data || res;
  },

  // 17.5 Push Notifications
  getPushNotifications: async (): Promise<PushNotificationItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/communications/push/notifications');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  sendPushNotification: async (dto: { userId: string; title: string; body: string }): Promise<any> => {
    const res = await api.post<any>('/api/v1/communications/push/send', dto);
    return res?.data || res;
  },
};
