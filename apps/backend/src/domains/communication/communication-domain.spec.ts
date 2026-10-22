import { describe, expect, it, beforeEach } from 'vitest';
import {
  renderTemplate,
  sanitizeChatMessage,
  validatePhoneNumber,
} from './domain/rules/template-engine.rule.js';
import {
  generateHmacSignature,
  verifyHmacSignature,
} from './domain/rules/webhook-signature.rule.js';
import { ChatService } from './application/services/chat.service.js';
import { WhatsappService } from './application/services/whatsapp.service.js';
import { SmsGatewayService } from './application/services/sms-gateway.service.js';
import { EmailTemplateService } from './application/services/email-template.service.js';
import { PushNotificationService } from './application/services/push-notification.service.js';
import { ICommunicationRepository } from './domain/repositories/communication.repository.interface.js';

class MockCommunicationRepository implements ICommunicationRepository {
  chatMessages: any[] = [];
  channels = new Map<string, any>();
  channelMembers: any[] = [];
  whatsappMessages: any[] = [];
  whatsappTemplates = new Map<string, any>();
  smsLogs: any[] = [];
  smsGateways = new Map<string, any>();
  emailTemplates = new Map<string, any>();
  emailCampaigns: any[] = [];
  emailLogs: any[] = [];
  pushSubscriptions = new Map<string, any>();
  pushNotifications: any[] = [];

  async createChatMessage(data: any) {
    const msg = { id: `cmsg-${Date.now()}-${Math.random()}`, ...data, createdAt: new Date() };
    this.chatMessages.push(msg);
    return msg;
  }
  async findChatMessagesBetween(userId1: string, userId2: string) {
    return this.chatMessages.filter(
      (m) =>
        (m.fromId === userId1 && m.toId === userId2) ||
        (m.fromId === userId2 && m.toId === userId1),
    );
  }
  async findChannelMessages(channelId: string) {
    return this.chatMessages.filter((m) => m.channelId === channelId);
  }
  async markMessagesAsSeen(messageIds: string[]) {
    this.chatMessages.forEach((m) => {
      if (messageIds.includes(m.id)) m.isSeen = true;
    });
    return { count: messageIds.length };
  }
  async createChannel(data: any) {
    const channel = { id: `chan-${Date.now()}`, ...data, createdAt: new Date(), members: [] };
    this.channels.set(channel.id, channel);
    return channel;
  }
  async findChannels(tenantId: string) {
    return Array.from(this.channels.values()).filter((c) => c.tenantId === tenantId);
  }
  async addChannelMember(channelId: string, userId: string, role: string = 'member') {
    const member = { id: `mem-${Date.now()}`, channelId, userId, role, joinedAt: new Date() };
    this.channelMembers.push(member);
    return member;
  }
  async getChannelMembers(channelId: string) {
    return this.channelMembers.filter((m) => m.channelId === channelId);
  }
  async createWhatsappMessage(data: any) {
    const wmsg = { id: `wmsg-${Date.now()}`, ...data, sentAt: new Date() };
    this.whatsappMessages.push(wmsg);
    return wmsg;
  }
  async findWhatsappMessages(tenantId: string) {
    return this.whatsappMessages.filter((w) => w.tenantId === tenantId);
  }
  async createWhatsappTemplate(data: any) {
    const tpl = { id: `wtpl-${Date.now()}`, ...data, createdAt: new Date() };
    this.whatsappTemplates.set(data.name, tpl);
    return tpl;
  }
  async findWhatsappTemplateByName(name: string) {
    return this.whatsappTemplates.get(name) || null;
  }
  async createSmsLog(data: any) {
    const log = { id: `sms-${Date.now()}`, ...data, sentAt: new Date() };
    this.smsLogs.push(log);
    return log;
  }
  async findSmsLogs(phoneTo?: string) {
    return this.smsLogs.filter((s) => !phoneTo || s.phoneTo === phoneTo);
  }
  async upsertSmsGateway(gatewayKey: string, data: any) {
    const gw = { id: `gw-${Date.now()}`, gatewayKey, ...data };
    this.smsGateways.set(gatewayKey, gw);
    return gw;
  }
  async findActiveSmsGateway() {
    return Array.from(this.smsGateways.values()).find((g) => g.isActive) || null;
  }
  async createEmailTemplate(data: any) {
    const tpl = { id: `etpl-${Date.now()}`, ...data, createdAt: new Date() };
    this.emailTemplates.set(data.name, tpl);
    return tpl;
  }
  async findEmailTemplateByName(name: string) {
    return this.emailTemplates.get(name) || null;
  }
  async findEmailTemplates() {
    return Array.from(this.emailTemplates.values());
  }
  async createEmailCampaign(data: any) {
    const camp = { id: `ecamp-${Date.now()}`, ...data, createdAt: new Date() };
    this.emailCampaigns.push(camp);
    return camp;
  }
  async findEmailCampaigns(tenantId: string) {
    return this.emailCampaigns.filter((c) => c.tenantId === tenantId);
  }
  async createEmailLog(data: any) {
    const log = { id: `elog-${Date.now()}`, ...data, sentAt: new Date() };
    this.emailLogs.push(log);
    return log;
  }
  async findEmailLogs(recipient?: string) {
    return this.emailLogs.filter((e) => !recipient || e.recipient === recipient);
  }
  async upsertPushSubscription(userId: string, data: any) {
    const sub = { id: `sub-${Date.now()}`, userId, ...data };
    this.pushSubscriptions.set(userId, sub);
    return sub;
  }
  async createPushNotification(data: any) {
    const notif = { id: `notif-${Date.now()}`, ...data, createdAt: new Date() };
    this.pushNotifications.push(notif);
    return notif;
  }
  async findPushNotifications(userId: string) {
    return this.pushNotifications.filter((n) => n.userId === userId);
  }
  async markPushNotificationAsRead(id: string) {
    const n = this.pushNotifications.find((x) => x.id === id);
    if (n) n.isRead = true;
    return n;
  }
}

describe('Phase 8: Omnichannel Communication & Messaging Infrastructure', () => {
  describe('Domain Rules - Template Engine & Webhook Security', () => {
    it('should render template with dynamic merge tags', () => {
      const template = 'Dear {guest_name}, welcome to {property_name}. Check-in: {check_in_date}. Total: ${total_amount}';
      const result = renderTemplate(template, {
        guest_name: 'John Doe',
        property_name: 'Azure Grand Resort',
        check_in_date: '2026-12-01',
        total_amount: 850,
      });

      expect(result.rendered).toBe('Dear John Doe, welcome to Azure Grand Resort. Check-in: 2026-12-01. Total: $850');
      expect(result.missingTags.length).toBe(0);
    });

    it('should track missing tags in template rendering', () => {
      const template = 'Hello {guest_name}, your room {room_number} is ready. Code: {door_code}';
      const result = renderTemplate(template, {
        guest_name: 'Jane Smith',
      });

      expect(result.missingTags).toContain('room_number');
      expect(result.missingTags).toContain('door_code');
    });

    it('should sanitize chat messages against XSS and script tags', () => {
      const dirty = '<script>alert("hacked")</script>Hello front desk! <b>Need towels</b>';
      const clean = sanitizeChatMessage(dirty);
      expect(clean).toBe('Hello front desk! Need towels');
    });

    it('should validate phone numbers per E.164 standard', () => {
      expect(validatePhoneNumber('+14155552671')).toBe(true);
      expect(validatePhoneNumber('+8801711223344')).toBe(true);
      expect(validatePhoneNumber('invalid-phone')).toBe(false);
      expect(validatePhoneNumber('123')).toBe(false);
    });

    it('should generate and verify HMAC-SHA256 signatures for inbound webhooks', () => {
      const payload = JSON.stringify({ event: 'whatsapp.message', from: '+14155552671', text: 'Hello' });
      const secret = 'super_secret_webhook_key_123';
      const signature = generateHmacSignature(payload, secret);

      expect(verifyHmacSignature(payload, signature, secret)).toBe(true);
      expect(verifyHmacSignature(payload, 'wrong_signature_hex', secret)).toBe(false);
      expect(verifyHmacSignature('tampered_payload', signature, secret)).toBe(false);
    });
  });

  describe('Application Services Integration', () => {
    let mockRepo: MockCommunicationRepository;
    let chatService: ChatService;
    let whatsappService: WhatsappService;
    let smsService: SmsGatewayService;
    let emailService: EmailTemplateService;
    let pushService: PushNotificationService;

    beforeEach(() => {
      mockRepo = new MockCommunicationRepository();
      chatService = new ChatService(mockRepo);
      whatsappService = new WhatsappService(mockRepo);
      smsService = new SmsGatewayService(mockRepo);
      emailService = new EmailTemplateService(mockRepo);
      pushService = new PushNotificationService(mockRepo);
    });

    it('should send direct 1-to-1 chat message and operational channel message', async () => {
      const directMsg = await chatService.sendMessage({
        fromId: 'guest-1',
        toId: 'frontdesk-1',
        body: 'Can I get a late checkout tomorrow?',
      });

      expect(directMsg.id).toBeDefined();
      expect(directMsg.body).toBe('Can I get a late checkout tomorrow?');

      const history = await chatService.getDirectMessages('guest-1', 'frontdesk-1');
      expect(history.length).toBe(1);

      const channel = await chatService.createChannel('tenant-1', {
        channelName: '#FrontDesk-Housekeeping',
      });
      expect(channel.id).toBeDefined();

      const channelMsg = await chatService.sendMessage({
        fromId: 'frontdesk-1',
        channelId: channel.id,
        body: 'Room 304 requested extra pillows.',
      });
      expect(channelMsg.channelId).toBe(channel.id);
    });

    it('should trigger automated transactional WhatsApp messages', async () => {
      const bookingAlert = await whatsappService.triggerBookingConfirmation(
        'tenant-1',
        '+14155552671',
        {
          guestName: 'Alice',
          bookingCode: 'BK-999',
          propertyName: 'Azure Palms',
          checkInDate: '2026-11-15',
        },
      );

      expect(bookingAlert.id).toBeDefined();
      expect(bookingAlert.direction).toBe('outbound');
      expect(bookingAlert.messageBody).toContain('BK-999');

      const roomReadyAlert = await whatsappService.triggerRoomReadyAlert(
        'tenant-1',
        '+14155552671',
        {
          guestName: 'Alice',
          roomNumber: '402',
          propertyName: 'Azure Palms',
        },
      );
      expect(roomReadyAlert.messageBody).toContain('Room 402');
    });

    it('should dispatch SMS and manage carrier configurations', async () => {
      await smsService.configureGateway({
        gatewayKey: 'twilio',
        apiKey: 'tw_key_123',
        isActive: true,
      });

      const sms = await smsService.sendSms({
        phoneTo: '+14155552671',
        message: 'Your OmniStay secure verification code is: 489201',
        isCriticalOtp: true,
      });

      expect(sms.status).toBe('delivered');
      expect(sms.cost).toBe(0.015);

      const logs = await smsService.getLogs('+14155552671');
      expect(logs.length).toBe(1);
    });

    it('should create dynamic email template, render with variables, and create campaigns', async () => {
      await emailService.createTemplate({
        name: 'booking_voucher',
        subject: 'Confirmation for {guest_name} at {property_name}',
        htmlBody: '<h1>Your Reservation is Confirmed</h1><p>Booking code: {booking_code}</p>',
      });

      const rendered = await emailService.renderTemplate({
        templateName: 'booking_voucher',
        mergeData: {
          guest_name: 'Michael Scott',
          property_name: 'Dunder Resort',
          booking_code: 'DUN-100',
        },
      });

      expect(rendered.subject).toContain('Michael Scott');
      expect(rendered.renderedHtml).toContain('DUN-100');

      const campaign = await emailService.createCampaign('tenant-1', {
        campaignName: 'Summer Solstice Promo',
        subject: 'Save 20% on Luxury Stays',
        recipientCount: 500,
      });

      expect(campaign.status).toBe('scheduled');
    });

    it('should register push subscriptions and send notifications', async () => {
      await pushService.subscribe('usr-device-1', {
        endpoint: 'https://fcm.googleapis.com/fcm/send/sample-token',
        authKey: 'auth_key_123',
        p256dhKey: 'p256dh_key_123',
      });

      const notification = await pushService.sendNotification({
        userId: 'usr-device-1',
        title: 'Room Ready Notification',
        body: 'Room 501 is ready for your arrival.',
      });

      expect(notification.isRead).toBe(false);

      const notifs = await pushService.getUserNotifications('usr-device-1');
      expect(notifs.length).toBe(1);

      await pushService.markAsRead(notification.id);
      expect(notifs[0].isRead).toBe(true);
    });
  });
});
