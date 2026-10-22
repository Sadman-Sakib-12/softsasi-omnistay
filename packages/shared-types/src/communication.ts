/**
 * Omnichannel Communication and Messaging Type Definitions
 * Covers Internal Chatify Messenger, WhatsApp Business API, SMS Gateways, Dynamic Email Templates & Push Notifications
 */

export interface ChatMessageDto {
  id?: string;
  fromId: string;
  toId?: string | null;
  channelId?: string | null;
  body: string;
  attachment?: string | null;
  isSeen?: boolean;
  createdAt?: Date;
}

export interface ChatChannelDto {
  id?: string;
  tenantId: string;
  channelName: string;
  isPrivate?: boolean;
  createdAt?: Date;
  members?: ChatChannelMemberDto[];
}

export interface ChatChannelMemberDto {
  id?: string;
  channelId: string;
  userId: string;
  role?: string;
  joinedAt?: Date;
}

export interface WhatsappMessageDto {
  id?: string;
  tenantId: string;
  recipientNo: string;
  messageBody: string;
  direction?: 'inbound' | 'outbound';
  status?: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: Date;
}

export interface WhatsappTemplateDto {
  id?: string;
  name: string;
  category: 'booking_confirmation' | 'pre_arrival_checkin' | 'room_ready' | 'folio_receipt' | 'support_concierge';
  content: string;
  isApproved?: boolean;
  createdAt?: Date;
}

export interface SmsLogDto {
  id?: string;
  phoneTo: string;
  message: string;
  gateway?: string;
  status?: 'sent' | 'delivered' | 'failed';
  cost?: number;
  sentAt?: Date;
}

export interface SmsGatewayDto {
  id?: string;
  gatewayKey: 'twilio' | 'vonage' | 'aws_sns' | 'regional_aggregator';
  apiKey: string;
  apiSecret?: string | null;
  senderId?: string | null;
  isActive?: boolean;
}

export interface EmailTemplateDto {
  id?: string;
  name: string;
  subject: string;
  htmlBody: string;
  mergeTags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationTemplateDto {
  id?: string;
  eventKey: string;
  title: string;
  content: string;
  channels: Array<'email' | 'whatsapp' | 'sms' | 'push'>;
  createdAt?: Date;
}

export interface EmailCampaignDto {
  id?: string;
  tenantId: string;
  campaignName: string;
  subject: string;
  recipientCount?: number;
  sentCount?: number;
  status?: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  scheduledAt?: Date | null;
  createdAt?: Date;
}

export interface EmailLogDto {
  id?: string;
  recipient: string;
  subject: string;
  status?: 'sent' | 'delivered' | 'bounced' | 'failed';
  provider?: string;
  sentAt?: Date;
}

export interface PushSubscriptionDto {
  id?: string;
  userId: string;
  endpoint: string;
  authKey: string;
  p256dhKey: string;
  createdAt?: Date;
}

export interface PushNotificationDto {
  id?: string;
  userId: string;
  title: string;
  body: string;
  isRead?: boolean;
  createdAt?: Date;
}

export interface SendMessageRequest {
  fromId: string;
  toId?: string;
  channelId?: string;
  body: string;
  attachment?: string;
}

export interface SendWhatsappRequest {
  tenantId: string;
  recipientNo: string;
  templateName?: string;
  customMessage?: string;
  mergeVariables?: Record<string, string>;
}

export interface SendSmsRequest {
  phoneTo: string;
  message: string;
  gateway?: string;
  isCriticalOtp?: boolean;
}

export interface RenderEmailTemplateRequest {
  templateName: string;
  mergeData: Record<string, string | number>;
}

export interface RenderEmailTemplateResult {
  templateName: string;
  subject: string;
  renderedHtml: string;
  missingTags: string[];
}

export interface SendPushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}
