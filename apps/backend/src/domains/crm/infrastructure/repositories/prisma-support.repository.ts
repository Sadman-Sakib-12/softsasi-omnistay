import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { ISupportRepository } from '../../domain/repositories/support.repository.interface.js';

@Injectable()
export class PrismaSupportRepository implements ISupportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countTickets(tenantId: string) {
    return this.prisma.supportTicket.count({ where: { tenantId } });
  }

  async createTicket(data: {
    tenantId: string;
    ticketCode: string;
    guestName: string;
    guestEmail?: string;
    subject: string;
    priority: string;
    status: string;
  }) {
    return this.prisma.supportTicket.create({
      data,
      include: { replies: true },
    });
  }

  async findTickets(tenantId: string) {
    return this.prisma.supportTicket.findMany({
      where: { tenantId },
      include: { replies: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTicketById(id: string) {
    return this.prisma.supportTicket.findUnique({
      where: { id },
      include: { replies: true },
    });
  }

  async addReply(data: { ticketId: string; senderType: string; message: string }) {
    return this.prisma.supportTicketReply.create({ data });
  }

  async updateTicket(id: string, data: Record<string, any>) {
    return this.prisma.supportTicket.update({
      where: { id },
      data,
    });
  }

  async createCannedResponse(data: { shortcut: string; title: string; response: string }) {
    return this.prisma.supportCannedResponse.create({ data });
  }

  async findCannedResponses() {
    return this.prisma.supportCannedResponse.findMany();
  }

  async createKnowledgeBase(data: { category: string; question: string; answer: string }) {
    return this.prisma.supportKnowledgeBase.create({ data });
  }

  async findKnowledgeBase(category?: string) {
    return this.prisma.supportKnowledgeBase.findMany({
      where: category ? { category } : undefined,
    });
  }
}
