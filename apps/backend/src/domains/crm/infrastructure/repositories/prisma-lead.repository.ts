import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { ILeadRepository } from '../../domain/repositories/lead.repository.interface.js';

@Injectable()
export class PrismaLeadRepository implements ILeadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createStage(data: { tenantId: string; name: string; displayOrder: number }) {
    return this.prisma.leadStage.create({ data });
  }

  async findStages(tenantId: string) {
    return this.prisma.leadStage.findMany({
      where: { tenantId },
      orderBy: { displayOrder: 'asc' },
      include: { leads: true },
    });
  }

  async findFirstStage(tenantId: string) {
    return this.prisma.leadStage.findFirst({
      where: { tenantId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async createLead(data: {
    tenantId: string;
    stageId?: string;
    title: string;
    contactName: string;
    email?: string;
    phone?: string;
    leadScore: number;
    source: string;
    assignedTo?: string;
  }) {
    return this.prisma.lead.create({
      data,
      include: {
        stage: true,
        callLogs: true,
        notes: true,
      },
    });
  }

  async findLeads(tenantId: string) {
    return this.prisma.lead.findMany({
      where: { tenantId },
      include: {
        stage: true,
        callLogs: true,
        notes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findLeadById(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: {
        stage: true,
        callLogs: true,
        notes: true,
      },
    });
  }

  async countOpenLeadsForUser(tenantId: string, userId: string) {
    return this.prisma.lead.count({
      where: { tenantId, assignedTo: userId },
    });
  }

  async updateLead(id: string, data: Record<string, any>) {
    return this.prisma.lead.update({
      where: { id },
      data,
      include: { stage: true },
    });
  }

  async addCallLog(data: { leadId: string; callSubject: string; callDuration: number; notes?: string }) {
    return this.prisma.leadCallLog.create({ data });
  }

  async addNote(data: { leadId: string; createdBy?: string; noteContent: string }) {
    return this.prisma.leadActivityNote.create({ data });
  }
}
