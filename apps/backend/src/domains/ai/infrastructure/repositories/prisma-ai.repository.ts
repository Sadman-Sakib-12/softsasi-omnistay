import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IAiRepository } from '../../domain/repositories/ai.repository.interface.js';

@Injectable()
export class PrismaAiRepository implements IAiRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findConfigByTenantId(tenantId: string): Promise<any | null> {
    return this.prisma.aiConciergeConfig.findUnique({
      where: { tenantId },
    });
  }

  async upsertConfig(tenantId: string, data: any): Promise<any> {
    return this.prisma.aiConciergeConfig.upsert({
      where: { tenantId },
      create: { tenantId, ...data },
      update: data,
    });
  }

  async findConversationBySession(sessionId: string): Promise<any | null> {
    return this.prisma.aiConversation.findUnique({
      where: { sessionId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        transactions: true,
      },
    });
  }

  async createConversation(data: any): Promise<any> {
    return this.prisma.aiConversation.create({
      data,
      include: { messages: true, transactions: true },
    });
  }

  async addConversationMessage(data: any): Promise<any> {
    return this.prisma.aiConversationMessage.create({
      data,
    });
  }

  async getConversationMessages(conversationId: string): Promise<any[]> {
    return this.prisma.aiConversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createKnowledgeDocument(data: any): Promise<any> {
    return this.prisma.aiKnowledgeDocument.create({
      data,
      include: { embeddings: true },
    });
  }

  async findKnowledgeDocuments(tenantId: string, category?: string): Promise<any[]> {
    return this.prisma.aiKnowledgeDocument.findMany({
      where: {
        tenantId,
        ...(category ? { category } : {}),
      },
      include: { embeddings: true },
    });
  }

  async searchKnowledgeDocuments(tenantId: string, query: string): Promise<any[]> {
    return this.prisma.aiKnowledgeDocument.findMany({
      where: {
        tenantId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });
  }

  async createInChatTransaction(data: any): Promise<any> {
    return this.prisma.aiInChatTransaction.create({
      data,
    });
  }

  async updateInChatTransaction(id: string, data: any): Promise<any> {
    return this.prisma.aiInChatTransaction.update({
      where: { id },
      data,
    });
  }

  async findInChatTransaction(id: string): Promise<any | null> {
    return this.prisma.aiInChatTransaction.findUnique({
      where: { id },
    });
  }

  async createDynamicPricingLog(data: any): Promise<any> {
    return this.prisma.aiDynamicPricingLog.create({
      data,
    });
  }

  async findDynamicPricingLogs(roomTypeId: string, limit: number = 20): Promise<any[]> {
    return this.prisma.aiDynamicPricingLog.findMany({
      where: { roomTypeId },
      orderBy: { computedAt: 'desc' },
      take: limit,
    });
  }

  async createMarketingCampaign(data: any): Promise<any> {
    return this.prisma.aiMarketingCampaign.create({
      data,
    });
  }

  async findMarketingCampaigns(tenantId: string): Promise<any[]> {
    return this.prisma.aiMarketingCampaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPredictiveForecast(data: any): Promise<any> {
    return this.prisma.aiPredictiveForecast.create({
      data,
    });
  }

  async findPredictiveForecasts(propertyId: string): Promise<any[]> {
    return this.prisma.aiPredictiveForecast.findMany({
      where: { propertyId },
      orderBy: { forecastDate: 'asc' },
    });
  }

  async createCompetitorPriceScrape(data: any): Promise<any> {
    return this.prisma.competitorPriceScrape.create({
      data,
    });
  }

  async findCompetitorPriceScrapes(propertyId: string): Promise<any[]> {
    return this.prisma.competitorPriceScrape.findMany({
      where: { propertyId },
      orderBy: { scrapedAt: 'desc' },
      take: 10,
    });
  }
}
