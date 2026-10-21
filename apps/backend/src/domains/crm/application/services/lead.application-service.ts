import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.interface.js';
import { LEAD_REPOSITORY_TOKEN } from '../../domain/repositories/lead.repository.interface.js';
import { calculateLeadScore } from '../../domain/rules/lead-scoring.rule.js';
import {
  AddLeadCallLogDto,
  AddLeadNoteDto,
  CreateLeadDto,
  CreateLeadStageDto,
} from '../../presentation/dto/lead.dto.js';

@Injectable()
export class LeadApplicationService {
  constructor(
    @Inject(LEAD_REPOSITORY_TOKEN)
    private readonly leadRepo: ILeadRepository,
  ) {}

  async createStage(tenantId: string, dto: CreateLeadStageDto) {
    return this.leadRepo.createStage({
      tenantId,
      name: dto.name,
      displayOrder: dto.displayOrder ?? 0,
    });
  }

  async getStages(tenantId: string) {
    return this.leadRepo.findStages(tenantId);
  }

  async createLead(tenantId: string, dto: CreateLeadDto) {
    // Pure domain rule evaluation
    const leadScore = calculateLeadScore(dto.budget, dto.guestCount, dto.durationDays);

    let stageId = dto.stageId;
    if (!stageId) {
      const defaultStage = await this.leadRepo.findFirstStage(tenantId);
      stageId = defaultStage?.id;
    }

    return this.leadRepo.createLead({
      tenantId,
      stageId,
      title: dto.title,
      contactName: dto.contactName,
      email: dto.email,
      phone: dto.phone,
      leadScore,
      source: dto.source ?? 'web_inquiry',
      assignedTo: dto.assignedTo,
    });
  }

  async getLeads(tenantId: string) {
    return this.leadRepo.findLeads(tenantId);
  }

  async getLeadById(id: string) {
    const lead = await this.leadRepo.findLeadById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  async assignLeadRoundRobin(tenantId: string, leadId: string, salesManagerIds: string[]) {
    if (!salesManagerIds.length) {
      throw new NotFoundException('No sales managers provided for round robin assignment');
    }

    // Pick sales manager with the fewest assigned open leads
    const managersWithCounts = await Promise.all(
      salesManagerIds.map(async (userId) => {
        const count = await this.leadRepo.countOpenLeadsForUser(tenantId, userId);
        return { userId, count };
      }),
    );

    managersWithCounts.sort((a, b) => a.count - b.count);
    const chosenManager = managersWithCounts[0].userId;

    return this.leadRepo.updateLead(leadId, { assignedTo: chosenManager });
  }

  async addCallLog(leadId: string, dto: AddLeadCallLogDto) {
    await this.getLeadById(leadId);
    return this.leadRepo.addCallLog({
      leadId,
      callSubject: dto.callSubject,
      callDuration: dto.callDuration ?? 0,
      notes: dto.notes,
    });
  }

  async addNote(leadId: string, userId: string, dto: AddLeadNoteDto) {
    await this.getLeadById(leadId);
    return this.leadRepo.addNote({
      leadId,
      createdBy: userId,
      noteContent: dto.noteContent,
    });
  }

  async updateLeadStage(leadId: string, stageId: string) {
    await this.getLeadById(leadId);
    return this.leadRepo.updateLead(leadId, { stageId });
  }
}
