import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { ICommunicationRepository } from '../../domain/repositories/communication.repository.interface.js';

function normalizeUuid(val?: string | null): string {
  if (!val) return '00000000-0000-4000-a000-000000000001';
  const clean = val.replace(/[^a-fA-F0-9]/g, '');
  if (clean.length === 32) {
    return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
  }
  const hex = Buffer.from(val).toString('hex').padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4000-a000-${hex.slice(20)}`;
}

export const CANONICAL_TENANT_ID = '00000000-0000-4000-a000-000000000001';
export const CANONICAL_STAFF_ID = '00000000-0000-4000-a000-000000000002';
export const CANONICAL_GUEST_ID = '00000000-0000-4000-a000-000000000003';

@Injectable()
export class PrismaCommunicationRepository implements ICommunicationRepository, OnModuleInit {
  private readonly logger = new Logger(PrismaCommunicationRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.ensureCanonicalSeed();
    } catch (err) {
      this.logger.warn(`Communication canonical seed deferred: ${(err as any)?.message}`);
    }
  }

  async ensureCanonicalSeed(): Promise<void> {
    try {
      const channelCount = await this.prisma.chatChannel.count();
      if (channelCount === 0) {
        this.logger.log('Seeding Chapter 17 Omnichannel Communication & Messaging data...');

        // 17.1 Chat Channels
        const ch1 = await this.prisma.chatChannel.create({
          data: {
            id: '00000000-0000-4000-a000-000000000011',
            tenantId: CANONICAL_TENANT_ID,
            channelName: 'FrontDesk-Housekeeping',
            isPrivate: false,
          },
        });

        const ch2 = await this.prisma.chatChannel.create({
          data: {
            id: '00000000-0000-4000-a000-000000000012',
            tenantId: CANONICAL_TENANT_ID,
            channelName: 'Maintenance-Emergency',
            isPrivate: false,
          },
        });

        const ch3 = await this.prisma.chatChannel.create({
          data: {
            id: '00000000-0000-4000-a000-000000000013',
            tenantId: CANONICAL_TENANT_ID,
            channelName: 'Management-Updates',
            isPrivate: true,
          },
        });

        const ch4 = await this.prisma.chatChannel.create({
          data: {
            id: '00000000-0000-4000-a000-000000000014',
            tenantId: CANONICAL_TENANT_ID,
            channelName: 'Guest-Chat-Suite-402',
            isPrivate: false,
          },
        });

        // 17.1 Chat Messages (Text, Voice Memo, Damage Photo, PDF)
        await this.prisma.chatMessage.createMany({
          data: [
            {
              fromId: CANONICAL_STAFF_ID,
              channelId: ch1.id,
              body: 'Suite 402 requested express refresh and late checkout until 2:00 PM.',
              isSeen: true,
              createdAt: new Date(Date.now() - 3600000 * 2),
            },
            {
              fromId: CANONICAL_STAFF_ID,
              channelId: ch2.id,
              body: 'HVAC fan coil unit in Ocean Villa 214 has an unusual harmonic vibration. Audio memo attached.',
              attachment: JSON.stringify({
                type: 'audio/webm',
                url: 'https://cdn.omnistay.com/audio/memo_suite402_ac.webm',
                durationSec: 18,
                caption: 'Voice memo: HVAC compressor sound log',
              }),
              isSeen: true,
              createdAt: new Date(Date.now() - 3600000 * 1.5),
            },
            {
              fromId: CANONICAL_STAFF_ID,
              channelId: ch2.id,
              body: 'Maintenance team, please inspect the damaged bathroom towel rack in Suite 214 before check-in.',
              attachment: JSON.stringify({
                type: 'image/jpeg',
                url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
                caption: 'Damaged bathroom towel rack in Suite 214',
              }),
              isSeen: true,
              createdAt: new Date(Date.now() - 3600000),
            },
            {
              fromId: CANONICAL_STAFF_ID,
              channelId: ch3.id,
              body: 'Here is the preliminary night audit and VIP arrivals report for today.',
              attachment: JSON.stringify({
                type: 'application/pdf',
                url: 'https://cdn.omnistay.com/docs/daily_audit_dispatch_nov06.pdf',
                caption: 'Daily Night Audit & Housekeeping Report.pdf',
              }),
              isSeen: true,
              createdAt: new Date(Date.now() - 1800000),
            },
            {
              fromId: CANONICAL_GUEST_ID,
              channelId: ch4.id,
              body: 'Hello Front Desk, could we please have 2 extra feather pillows delivered to Suite 402?',
              isSeen: true,
              createdAt: new Date(Date.now() - 900000),
            },
            {
              fromId: CANONICAL_STAFF_ID,
              channelId: ch4.id,
              body: 'Certainly Mr. Vance! Our housekeeping attendant is on the way with 2 hypoallergenic feather pillows. Delivery in 5 minutes.',
              isSeen: true,
              createdAt: new Date(Date.now() - 600000),
            },
          ],
        });

        // 17.2 WhatsApp Templates & Messages
        const waTemplates = [
          {
            name: 'booking_confirmation_v2',
            category: 'booking_confirmation',
            content: 'Hello {{guest_name}}! Your reservation {{booking_reference}} at {{property_name}} is confirmed for {{check_in_date}}. View digital pass: {{qr_code_url}}',
          },
          {
            name: 'pre_arrival_checkin_pass',
            category: 'pre_arrival_checkin',
            content: 'Welcome {{guest_name}}! 24-hr express online check-in is now ready for your stay at {{property_name}}. Complete registration: {{qr_code_url}}',
          },
          {
            name: 'room_ready_notification',
            category: 'room_ready',
            content: 'Great news {{guest_name}}! Your {{room_type}} is inspected and ready. Your digital BLE keycard is unlocked on the OmniStay App.',
          },
          {
            name: 'folio_receipt',
            category: 'folio_receipt',
            content: 'Thank you for staying at {{property_name}}, {{guest_name}}! Your digital checkout folio total: {{total_amount}}. Safe travels!',
          },
        ];

        for (const wt of waTemplates) {
          await this.prisma.whatsappTemplate.upsert({
            where: { name: wt.name },
            create: wt,
            update: wt,
          });
        }

        await this.prisma.whatsappMessage.createMany({
          data: [
            {
              tenantId: CANONICAL_TENANT_ID,
              recipientNo: '+14155552671',
              messageBody: 'Hello David! Your reservation OST-98234 at Grand Palace Resort is confirmed for Nov 15, 2026. View digital pass: https://omnistay.com/key/ost98234',
              direction: 'outbound',
              status: 'delivered',
              sentAt: new Date(Date.now() - 86400000),
            },
            {
              tenantId: CANONICAL_TENANT_ID,
              recipientNo: '+14155552671',
              messageBody: 'Hi! Can we request late checkout and also what is the executive lounge Wi-Fi password?',
              direction: 'inbound',
              status: 'delivered',
              sentAt: new Date(Date.now() - 3600000 * 3),
            },
            {
              tenantId: CANONICAL_TENANT_ID,
              recipientNo: '+14155552671',
              messageBody: 'Softsasi AI Concierge: We have noted your 1:00 PM late checkout request! The Executive Lounge Wi-Fi SSID is "OmniStay-VIP" and passcode is "Sanctuary2026!".',
              direction: 'outbound',
              status: 'delivered',
              sentAt: new Date(Date.now() - 3600000 * 2.8),
            },
          ],
        });

        // 17.3 SMS Gateways & Delivery Logs
        const gateways = [
          { gatewayKey: 'twilio', apiKey: 'SK_TWILIO_LIVE_9941', senderId: 'OmniStay', isActive: true },
          { gatewayKey: 'vonage', apiKey: 'NEXMO_ENTERPRISE_771', senderId: 'OmniStay', isActive: true },
          { gatewayKey: 'aws_sns', apiKey: 'AKIA_AWS_SNS_GLOBAL', senderId: 'OmniAlert', isActive: false },
          { gatewayKey: 'regional_aggregator', apiKey: 'REGIONAL_SMS_GATEWAY_BD', senderId: 'Softsasi', isActive: true },
        ];

        for (const gw of gateways) {
          await this.prisma.smsGateway.upsert({
            where: { gatewayKey: gw.gatewayKey },
            create: gw,
            update: gw,
          });
        }

        await this.prisma.smsLog.createMany({
          data: [
            {
              phoneTo: '+14155550192',
              message: 'Your OmniStay 2FA Security Login Code is 839201. Valid for 5 minutes.',
              gateway: 'twilio',
              status: 'delivered',
              cost: 0.015,
              sentAt: new Date(Date.now() - 14400000),
            },
            {
              phoneTo: '+447911123456',
              message: 'Grand Palace Resort: Master Suite 501 Door Lock PIN: *9428#. Valid from 3:00 PM today.',
              gateway: 'twilio',
              status: 'delivered',
              cost: 0.015,
              sentAt: new Date(Date.now() - 7200000),
            },
            {
              phoneTo: '+16505550183',
              message: '[EMERGENCY NOTICE] Scheduled fire alarm audio testing in South Wing today at 11:30 AM.',
              gateway: 'vonage',
              status: 'delivered',
              cost: 0.0075,
              sentAt: new Date(Date.now() - 3600000),
            },
          ],
        });

        // 17.4 Email Campaigns (Lifecycle Sequences)
        await this.prisma.emailCampaign.createMany({
          data: [
            {
              tenantId: CANONICAL_TENANT_ID,
              campaignName: 'High-Value Leisure VIP Welcome Sequence (17.4)',
              subject: 'Welcome to Grand Palace Sanctuary — Itinerary & Curated Privileges',
              recipientCount: 420,
              sentCount: 420,
              status: 'completed',
            },
            {
              tenantId: CANONICAL_TENANT_ID,
              campaignName: '7-Day Pre-Arrival Destination Guide & Cabana Upsell (17.4)',
              subject: '7 Days until your arrival: Personalized Concierge & Limousine Options',
              recipientCount: 185,
              sentCount: 185,
              status: 'completed',
            },
            {
              tenantId: CANONICAL_TENANT_ID,
              campaignName: '24-Hour Digital Key & Contactless Check-In Pass (17.4)',
              subject: 'Your Room is Ready! Bypass the Front Desk with OmniStay Mobile Key',
              recipientCount: 92,
              sentCount: 92,
              status: 'completed',
            },
            {
              tenantId: CANONICAL_TENANT_ID,
              campaignName: 'Post-Stay Review & 500 Loyalty Bonus Points Campaign (17.4)',
              subject: 'How was your stay? Review your experience & earn 500 Loyalty Points',
              recipientCount: 310,
              sentCount: 308,
              status: 'active',
            },
            {
              tenantId: CANONICAL_TENANT_ID,
              campaignName: '6-Month Anniversary Return Booking Discount (SAVE15) (17.4)',
              subject: 'We miss hosting you! Enjoy an exclusive 15% return sanctuary discount',
              recipientCount: 550,
              sentCount: 0,
              status: 'scheduled',
              scheduledAt: new Date(Date.now() + 86400000 * 7),
            },
          ],
        });

        // 17.5 Push Notifications (FCM / Web Push)
        await this.prisma.pushNotification.createMany({
          data: [
            {
              userId: CANONICAL_STAFF_ID,
              title: 'New Web Booking Received',
              body: 'Arthur Vance booked Royal Sunset Sky Penthouse 801 ($4,200). Check-in Nov 15.',
              isRead: false,
              createdAt: new Date(Date.now() - 3600000 * 4),
            },
            {
              userId: CANONICAL_STAFF_ID,
              title: 'Guest Service Request: Suite 402',
              body: 'David Vance requested 2 feather pillows and valet luggage pickup at curbside.',
              isRead: true,
              createdAt: new Date(Date.now() - 3600000 * 2),
            },
            {
              userId: CANONICAL_STAFF_ID,
              title: 'Housekeeping Status Update',
              body: 'Suite 214 inspection complete. Status updated to Clean & Ready for arrival.',
              isRead: true,
              createdAt: new Date(Date.now() - 3600000),
            },
          ],
        });

        this.logger.log('Chapter 17 Omnichannel Communication seeded successfully.');
      }
    } catch (err) {
      this.logger.error(`Error in ensureCanonicalSeed: ${(err as any)?.message}`);
    }
  }

  // Chat Operations
  async createChatMessage(data: any): Promise<any> {
    return this.prisma.chatMessage.create({
      data: {
        fromId: normalizeUuid(data.fromId),
        toId: data.toId ? normalizeUuid(data.toId) : null,
        channelId: data.channelId ? normalizeUuid(data.channelId) : null,
        body: data.body,
        attachment: data.attachment || null,
        isSeen: data.isSeen ?? false,
      },
    });
  }

  async findChatMessagesBetween(userId1: string, userId2: string, limit: number = 50): Promise<any[]> {
    const u1 = normalizeUuid(userId1);
    const u2 = normalizeUuid(userId2);
    return this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { fromId: u1, toId: u2 },
          { fromId: u2, toId: u1 },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async findChannelMessages(channelId: string, limit: number = 50): Promise<any[]> {
    const chId = normalizeUuid(channelId);
    return this.prisma.chatMessage.findMany({
      where: { channelId: chId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async markMessagesAsSeen(messageIds: string[]): Promise<any> {
    const ids = messageIds.map(normalizeUuid);
    return this.prisma.chatMessage.updateMany({
      where: { id: { in: ids } },
      data: { isSeen: true },
    });
  }

  async createChannel(data: any): Promise<any> {
    return this.prisma.chatChannel.create({
      data: {
        tenantId: normalizeUuid(data.tenantId),
        channelName: data.channelName,
        isPrivate: data.isPrivate ?? false,
      },
      include: { members: true },
    });
  }

  async findChannels(tenantId?: string): Promise<any[]> {
    await this.ensureCanonicalSeed();
    const tId = normalizeUuid(tenantId);
    const channels = await this.prisma.chatChannel.findMany({
      where: tenantId ? { tenantId: tId } : {},
      include: { members: true },
      orderBy: { createdAt: 'asc' },
    });

    if (channels.length === 0) {
      return this.prisma.chatChannel.findMany({
        include: { members: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    return channels;
  }

  async addChannelMember(channelId: string, userId: string, role: string = 'member'): Promise<any> {
    const chId = normalizeUuid(channelId);
    const uId = normalizeUuid(userId);
    return this.prisma.chatChannelMember.upsert({
      where: {
        channelId_userId: { channelId: chId, userId: uId },
      },
      create: { channelId: chId, userId: uId, role },
      update: { role },
    });
  }

  async getChannelMembers(channelId: string): Promise<any[]> {
    const chId = normalizeUuid(channelId);
    return this.prisma.chatChannelMember.findMany({
      where: { channelId: chId },
    });
  }

  // WhatsApp Operations
  async createWhatsappMessage(data: any): Promise<any> {
    return this.prisma.whatsappMessage.create({
      data: {
        tenantId: normalizeUuid(data.tenantId),
        recipientNo: data.recipientNo,
        messageBody: data.messageBody,
        direction: data.direction || 'outbound',
        status: data.status || 'sent',
      },
    });
  }

  async findWhatsappMessages(tenantId?: string): Promise<any[]> {
    await this.ensureCanonicalSeed();
    const tId = normalizeUuid(tenantId);
    return this.prisma.whatsappMessage.findMany({
      where: tenantId ? { tenantId: tId } : {},
      orderBy: { sentAt: 'desc' },
      take: 50,
    });
  }

  async createWhatsappTemplate(data: any): Promise<any> {
    return this.prisma.whatsappTemplate.create({ data });
  }

  async findWhatsappTemplateByName(name: string): Promise<any | null> {
    return this.prisma.whatsappTemplate.findUnique({
      where: { name },
    });
  }

  // SMS Operations
  async createSmsLog(data: any): Promise<any> {
    return this.prisma.smsLog.create({
      data: {
        phoneTo: data.phoneTo,
        message: data.message,
        gateway: data.gateway || 'twilio',
        status: data.status || 'delivered',
        cost: data.cost || 0.01,
      },
    });
  }

  async findSmsLogs(phoneTo?: string): Promise<any[]> {
    await this.ensureCanonicalSeed();
    return this.prisma.smsLog.findMany({
      where: phoneTo ? { phoneTo } : {},
      orderBy: { sentAt: 'desc' },
      take: 50,
    });
  }

  async upsertSmsGateway(gatewayKey: string, data: any): Promise<any> {
    return this.prisma.smsGateway.upsert({
      where: { gatewayKey },
      create: { gatewayKey, ...data },
      update: data,
    });
  }

  async findActiveSmsGateway(): Promise<any | null> {
    return this.prisma.smsGateway.findFirst({
      where: { isActive: true },
    });
  }

  async findSmsGateways(): Promise<any[]> {
    await this.ensureCanonicalSeed();
    return this.prisma.smsGateway.findMany({
      orderBy: { gatewayKey: 'asc' },
    });
  }

  // Email Templates & Campaigns
  async createEmailTemplate(data: any): Promise<any> {
    return this.prisma.emailTemplate.create({ data });
  }

  async updateEmailTemplate(id: string, data: any): Promise<any> {
    const tId = normalizeUuid(id);
    return this.prisma.emailTemplate.update({
      where: { id: tId },
      data,
    });
  }

  async deleteEmailTemplate(id: string): Promise<any> {
    const tId = normalizeUuid(id);
    return this.prisma.emailTemplate.delete({
      where: { id: tId },
    });
  }

  async findEmailTemplateByName(name: string): Promise<any | null> {
    return this.prisma.emailTemplate.findUnique({
      where: { name },
    });
  }

  async findEmailTemplates(): Promise<any[]> {
    const existing = await this.prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (existing.length > 0) {
      return existing;
    }

    // Auto-seed the 5 Master Email Templates (Chapter 17.4)
    const defaultTemplates = [
      {
        name: 'Welcome & Instant Booking Confirmation (17.4)',
        subject: 'Booking Confirmed: Welcome to {property_name}, {guest_name}!',
        mergeTags: [
          '{guest_name}',
          '{property_name}',
          '{booking_reference}',
          '{check_in_date}',
          '{check_out_date}',
          '{room_type}',
          '{total_amount}',
          '{qr_code_url}',
        ],
        htmlBody: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">{property_name}</h1>
    <p style="margin: 8px 0 0; font-size: 14px; color: #94a3b8;">Luxury Hospitality & Sanctuary</p>
  </div>
  <div style="padding: 32px 24px;">
    <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Reservation Confirmed, {guest_name}!</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      We are delighted to confirm your upcoming stay. Below are your official reservation itinerary details and contactless check-in pass.
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; margin: 24px 0;">
      <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Confirmation Code:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #00a8ff;">{booking_reference}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Reserved Accommodations:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right;">{room_type}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Check-In Date:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right;">{check_in_date} (From 3:00 PM)</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Check-Out Date:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right;">{check_out_date} (By 11:00 AM)</td>
        </tr>
        <tr style="border-top: 1px solid #cbd5e1;">
          <td style="padding: 10px 0 0; color: #0f172a; font-weight: 700;">Total Charged:</td>
          <td style="padding: 10px 0 0; font-weight: 700; text-align: right; color: #10b981; font-size: 15px;">{total_amount}</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{qr_code_url}" style="background: #00a8ff; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
        View Digital Key & Reservation
      </a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
    OmniStay Hospitality Operating System • Automated Guest Dispatch Service
  </div>
</div>`,
      },
      {
        name: '7-Day Pre-Arrival Concierge & Upsell (17.4)',
        subject: 'Countdown to Your Sanctuary: 7 Days until your arrival at {property_name}',
        mergeTags: ['{guest_name}', '{property_name}', '{check_in_date}', '{room_type}'],
        htmlBody: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 700;">7 Days to Your Escape at {property_name}</h1>
    <p style="margin: 8px 0 0; font-size: 14px; color: #e0f2fe;">Dear {guest_name}, your stay begins {check_in_date}</p>
  </div>
  <div style="padding: 32px 24px;">
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      Our concierge team is finalizing preparations for your reserved <strong>{room_type}</strong>. To ensure your stay is utterly effortless, we invite you to personalize your itinerary with our signature bespoke services:
    </p>
    <div style="display: grid; gap: 14px; margin: 24px 0;">
      <div style="padding: 14px; border: 1px solid #e2e8f0; border-radius: 6px; background: #f8fafc;">
        <h4 style="margin: 0 0 4px; font-size: 14px; color: #0f172a;">Airport Private Limousine Chauffeur</h4>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Direct terminal curbside meet-and-greet in an executive Mercedes-Maybach sedan.</p>
      </div>
      <div style="padding: 14px; border: 1px solid #e2e8f0; border-radius: 6px; background: #f8fafc;">
        <h4 style="margin: 0 0 4px; font-size: 14px; color: #0f172a;">Ayurvedic Spa & Sunset Horizon Cabana</h4>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Reserve preferred couples massage slots before appointments fill up for the weekend.</p>
      </div>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
    {property_name} Concierge Team • Always at your service
  </div>
</div>`,
      },
      {
        name: '24-Hour Digital Key & Express Check-In (17.4)',
        subject: 'Your Room is Ready! Instant Digital Key & Check-In for {guest_name}',
        mergeTags: ['{guest_name}', '{property_name}', '{room_type}', '{qr_code_url}'],
        htmlBody: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
  <div style="background: #10b981; padding: 28px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Your Digital Key is Activated</h1>
    <p style="margin: 6px 0 0; font-size: 13px; color: #ecfdf5;">Bypass the front desk queue at {property_name}</p>
  </div>
  <div style="padding: 32px 24px; text-align: center;">
    <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Welcome, {guest_name}!</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569; max-width: 460px; margin: 0 auto;">
      Your assigned <strong>{room_type}</strong> has been inspected and prepared. You can walk straight to your suite upon arrival.
    </p>
  </div>
</div>`,
      },
      {
        name: 'Post-Stay Departure Review & Loyalty CSAT (17.4)',
        subject: 'Thank you for staying with us, {guest_name} — Rate your OmniStay experience',
        mergeTags: ['{guest_name}', '{property_name}', '{room_type}'],
        htmlBody: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
  <div style="background: #0f172a; padding: 30px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Safe Travels Home, {guest_name}!</h1>
  </div>
</div>`,
      },
    ];

    for (const t of defaultTemplates) {
      await this.prisma.emailTemplate.create({ data: t });
    }

    return this.prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEmailCampaign(data: any): Promise<any> {
    return this.prisma.emailCampaign.create({
      data: {
        tenantId: normalizeUuid(data.tenantId),
        campaignName: data.campaignName,
        subject: data.subject,
        recipientCount: data.recipientCount || 0,
        sentCount: data.sentCount || 0,
        status: data.status || 'scheduled',
        scheduledAt: data.scheduledAt || null,
      },
    });
  }

  async findEmailCampaigns(tenantId?: string): Promise<any[]> {
    await this.ensureCanonicalSeed();
    const tId = normalizeUuid(tenantId);
    return this.prisma.emailCampaign.findMany({
      where: tenantId ? { tenantId: tId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEmailLog(data: any): Promise<any> {
    return this.prisma.emailLog.create({ data });
  }

  async findEmailLogs(recipient?: string): Promise<any[]> {
    return this.prisma.emailLog.findMany({
      where: recipient ? { recipient } : {},
      orderBy: { sentAt: 'desc' },
      take: 50,
    });
  }

  // Push Notifications
  async upsertPushSubscription(userId: string, data: any): Promise<any> {
    const uId = normalizeUuid(userId);
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: { userId: uId, ...data },
      update: { userId: uId, authKey: data.authKey, p256dhKey: data.p256dhKey },
    });
  }

  async createPushNotification(data: any): Promise<any> {
    const uId = normalizeUuid(data.userId);
    return this.prisma.pushNotification.create({
      data: {
        userId: uId,
        title: data.title,
        body: data.body,
        isRead: data.isRead ?? false,
      },
    });
  }

  async findPushNotifications(userId: string): Promise<any[]> {
    await this.ensureCanonicalSeed();
    const uId = normalizeUuid(userId);
    return this.prisma.pushNotification.findMany({
      where: { userId: uId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  async markPushNotificationAsRead(id: string): Promise<any> {
    const nId = normalizeUuid(id);
    return this.prisma.pushNotification.update({
      where: { id: nId },
      data: { isRead: true },
    });
  }

  // Chapter 17 Enterprise Communication Overview
  async getCommunicationOverview(tenantId?: string): Promise<any> {
    await this.ensureCanonicalSeed();
    const tId = normalizeUuid(tenantId);

    const [channels, whatsappMsgs, smsLogs, smsGateways, emailTemplates, emailCampaigns, pushNotifs] =
      await Promise.all([
        this.prisma.chatChannel.findMany({
          where: tenantId ? { tenantId: tId } : {},
          include: { members: true },
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.whatsappMessage.findMany({
          where: tenantId ? { tenantId: tId } : {},
          orderBy: { sentAt: 'desc' },
          take: 30,
        }),
        this.prisma.smsLog.findMany({
          orderBy: { sentAt: 'desc' },
          take: 30,
        }),
        this.prisma.smsGateway.findMany({
          orderBy: { gatewayKey: 'asc' },
        }),
        this.prisma.emailTemplate.findMany({
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.emailCampaign.findMany({
          where: tenantId ? { tenantId: tId } : {},
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.pushNotification.findMany({
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
      ]);

    // Calculate telemetry summary
    const totalSmsCost = smsLogs.reduce((acc, log) => acc + Number(log.cost || 0), 0);
    const deliveredSms = smsLogs.filter((s) => s.status === 'delivered').length;
    const smsSuccessRate = smsLogs.length > 0 ? Math.round((deliveredSms / smsLogs.length) * 100) : 100;
    const activeGateways = smsGateways.filter((g) => g.isActive).length;
    const totalCampaignRecipients = emailCampaigns.reduce((acc, c) => acc + Number(c.recipientCount || 0), 0);
    const totalCampaignSent = emailCampaigns.reduce((acc, c) => acc + Number(c.sentCount || 0), 0);

    return {
      channels,
      whatsapp: {
        messages: whatsappMsgs,
        totalMessages: whatsappMsgs.length,
        inboundCount: whatsappMsgs.filter((m) => m.direction === 'inbound').length,
        outboundCount: whatsappMsgs.filter((m) => m.direction === 'outbound').length,
      },
      sms: {
        gateways: smsGateways,
        activeGateways,
        logs: smsLogs,
        totalCost: totalSmsCost,
        successRate: smsSuccessRate,
      },
      email: {
        templates: emailTemplates,
        campaigns: emailCampaigns,
        totalRecipients: totalCampaignRecipients,
        totalSent: totalCampaignSent,
      },
      push: {
        notifications: pushNotifs,
        unreadCount: pushNotifs.filter((p) => !p.isRead).length,
      },
      summary: {
        totalChannels: channels.length,
        activeWhatsappChats: whatsappMsgs.length,
        smsGatewaysCount: smsGateways.length,
        emailTemplatesCount: emailTemplates.length,
        emailCampaignsCount: emailCampaigns.length,
        pushNotificationsCount: pushNotifs.length,
      },
    };
  }
}
