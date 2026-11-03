import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { ICommunicationRepository } from '../../domain/repositories/communication.repository.interface.js';

@Injectable()
export class PrismaCommunicationRepository implements ICommunicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createChatMessage(data: any): Promise<any> {
    return this.prisma.chatMessage.create({ data });
  }

  async findChatMessagesBetween(userId1: string, userId2: string, limit: number = 50): Promise<any[]> {
    return this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { fromId: userId1, toId: userId2 },
          { fromId: userId2, toId: userId1 },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async findChannelMessages(channelId: string, limit: number = 50): Promise<any[]> {
    return this.prisma.chatMessage.findMany({
      where: { channelId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async markMessagesAsSeen(messageIds: string[]): Promise<any> {
    return this.prisma.chatMessage.updateMany({
      where: { id: { in: messageIds } },
      data: { isSeen: true },
    });
  }

  async createChannel(data: any): Promise<any> {
    return this.prisma.chatChannel.create({
      data,
      include: { members: true },
    });
  }

  async findChannels(tenantId: string): Promise<any[]> {
    return this.prisma.chatChannel.findMany({
      where: { tenantId },
      include: { members: true },
    });
  }

  async addChannelMember(channelId: string, userId: string, role: string = 'member'): Promise<any> {
    return this.prisma.chatChannelMember.upsert({
      where: {
        channelId_userId: { channelId, userId },
      },
      create: { channelId, userId, role },
      update: { role },
    });
  }

  async getChannelMembers(channelId: string): Promise<any[]> {
    return this.prisma.chatChannelMember.findMany({
      where: { channelId },
    });
  }

  async createWhatsappMessage(data: any): Promise<any> {
    return this.prisma.whatsappMessage.create({ data });
  }

  async findWhatsappMessages(tenantId: string): Promise<any[]> {
    return this.prisma.whatsappMessage.findMany({
      where: { tenantId },
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

  async createSmsLog(data: any): Promise<any> {
    return this.prisma.smsLog.create({ data });
  }

  async findSmsLogs(phoneTo?: string): Promise<any[]> {
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

  async createEmailTemplate(data: any): Promise<any> {
    return this.prisma.emailTemplate.create({ data });
  }

  async updateEmailTemplate(id: string, data: any): Promise<any> {
    return this.prisma.emailTemplate.update({
      where: { id },
      data,
    });
  }

  async deleteEmailTemplate(id: string): Promise<any> {
    return this.prisma.emailTemplate.delete({
      where: { id },
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

    // Auto-seed the 4 PDF Master Email Templates (Chapter 17.4)
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
        <h4 style="margin: 0 0 4px; font-size: 14px; color: #0f172a;">🚗 Airport Private Limousine Chauffeur</h4>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Direct terminal curbside meet-and-greet in an executive Mercedes-Maybach sedan.</p>
      </div>
      <div style="padding: 14px; border: 1px solid #e2e8f0; border-radius: 6px; background: #f8fafc;">
        <h4 style="margin: 0 0 4px; font-size: 14px; color: #0f172a;">💆 Ayurvedic Spa & Sunset Horizon Cabana</h4>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Reserve preferred couples massage slots before appointments fill up for the weekend.</p>
      </div>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="https://omnistay.com/concierge" style="background: #00a8ff; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
        Customize Concierge Preferences
      </a>
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
    <div style="margin: 24px auto; padding: 20px; border: 2px dashed #10b981; border-radius: 8px; display: inline-block; background: #f0fdf4;">
      <div style="font-size: 13px; font-weight: 700; color: #065f46; margin-bottom: 8px;">NFC & BLE Smart Lock Key Ready</div>
      <a href="{qr_code_url}" style="background: #10b981; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 13px; display: inline-block;">
        Unlock Room with OmniStay Mobile Pass
      </a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
    IoT Smart Lock Node ID: Encrypted Dynamic Token (AES-128)
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
    <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">It was an honor hosting you at {property_name}</p>
  </div>
  <div style="padding: 32px 24px; text-align: center;">
    <h3 style="font-size: 16px; color: #1e293b; margin-top: 0;">How was your experience in {room_type}?</h3>
    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
      Your honest feedback guides our ongoing commitment to five-star hospitality. Click below to share your stay review:
    </p>
    <div style="font-size: 28px; letter-spacing: 6px; margin: 20px 0; cursor: pointer;">
      ⭐ ⭐ ⭐ ⭐ ⭐
    </div>
    <div style="margin-top: 20px;">
      <a href="https://omnistay.com/review" style="background: #00a8ff; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
        Submit 2-Minute Review & Earn 500 Loyalty Points
      </a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
    OmniStay Hospitality Rewards Program
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
    return this.prisma.emailCampaign.create({ data });
  }

  async findEmailCampaigns(tenantId: string): Promise<any[]> {
    return this.prisma.emailCampaign.findMany({
      where: { tenantId },
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

  async upsertPushSubscription(userId: string, data: any): Promise<any> {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: { userId, ...data },
      update: { userId, authKey: data.authKey, p256dhKey: data.p256dhKey },
    });
  }

  async createPushNotification(data: any): Promise<any> {
    return this.prisma.pushNotification.create({ data });
  }

  async findPushNotifications(userId: string): Promise<any[]> {
    return this.prisma.pushNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  async markPushNotificationAsRead(id: string): Promise<any> {
    return this.prisma.pushNotification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
