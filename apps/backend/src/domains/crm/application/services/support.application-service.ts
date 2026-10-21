import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ISupportRepository } from '../../domain/repositories/support.repository.interface.js';
import { SUPPORT_REPOSITORY_TOKEN } from '../../domain/repositories/support.repository.interface.js';
import {
  CreateCannedResponseDto,
  CreateKnowledgeBaseItemDto,
  CreateSupportTicketDto,
  ReplySupportTicketDto,
} from '../../presentation/dto/support.dto.js';

@Injectable()
export class SupportApplicationService {
  constructor(
    @Inject(SUPPORT_REPOSITORY_TOKEN)
    private readonly supportRepo: ISupportRepository,
  ) {}

  async createTicket(tenantId: string, dto: CreateSupportTicketDto) {
    const count = await this.supportRepo.countTickets(tenantId);
    const ticketCode = `TCK-${Date.now().toString().slice(-4)}-${(count + 1).toString().padStart(4, '0')}`;

    return this.supportRepo.createTicket({
      tenantId,
      ticketCode,
      guestName: dto.guestName,
      guestEmail: dto.guestEmail,
      subject: dto.subject,
      priority: dto.priority ?? 'normal',
      status: 'open',
    });
  }

  async getTickets(tenantId: string) {
    return this.supportRepo.findTickets(tenantId);
  }

  async getTicketById(id: string) {
    const ticket = await this.supportRepo.findTicketById(id);
    if (!ticket) throw new NotFoundException(`Support ticket ${id} not found`);
    return ticket;
  }

  async replyTicket(ticketId: string, dto: ReplySupportTicketDto) {
    await this.getTicketById(ticketId);
    return this.supportRepo.addReply({
      ticketId,
      senderType: dto.senderType,
      message: dto.message,
    });
  }

  async updateTicketStatus(ticketId: string, status: string) {
    await this.getTicketById(ticketId);
    return this.supportRepo.updateTicket(ticketId, { status });
  }

  async createCannedResponse(dto: CreateCannedResponseDto) {
    return this.supportRepo.createCannedResponse({
      shortcut: dto.shortcut,
      title: dto.title,
      response: dto.response,
    });
  }

  async getCannedResponses() {
    return this.supportRepo.findCannedResponses();
  }

  async createKnowledgeBase(dto: CreateKnowledgeBaseItemDto) {
    return this.supportRepo.createKnowledgeBase({
      category: dto.category,
      question: dto.question,
      answer: dto.answer,
    });
  }

  async getKnowledgeBase(category?: string) {
    return this.supportRepo.findKnowledgeBase(category);
  }
}
