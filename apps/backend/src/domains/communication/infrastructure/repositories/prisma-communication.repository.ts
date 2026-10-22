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

  async findEmailTemplateByName(name: string): Promise<any | null> {
    return this.prisma.emailTemplate.findUnique({
      where: { name },
    });
  }

  async findEmailTemplates(): Promise<any[]> {
    return this.prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' },
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
