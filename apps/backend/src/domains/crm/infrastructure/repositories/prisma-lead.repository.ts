import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { ILeadRepository } from '../../domain/repositories/lead.repository.interface.js';

function normalizeTenantId(id?: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (id && uuidRegex.test(id)) return id;
  return '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525';
}

@Injectable()
export class PrismaLeadRepository implements ILeadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createStage(data: { tenantId: string; name: string; displayOrder: number }) {
    return this.prisma.leadStage.create({
      data: {
        tenantId: normalizeTenantId(data.tenantId),
        name: data.name,
        displayOrder: data.displayOrder ?? 0,
      },
    });
  }

  async findStages(tenantId: string) {
    const tid = normalizeTenantId(tenantId);
    let stages = await this.prisma.leadStage.findMany({
      where: { tenantId: tid },
      orderBy: { displayOrder: 'asc' },
      include: { leads: true },
    });

    if (stages.length === 0) {
      const defaultStages = [
        { name: 'New Inquiry', displayOrder: 1 },
        { name: 'Qualified / Discovery', displayOrder: 2 },
        { name: 'Proposal Sent', displayOrder: 3 },
        { name: 'Contract Negotiation', displayOrder: 4 },
        { name: 'Closed Won', displayOrder: 5 },
      ];
      for (const s of defaultStages) {
        await this.prisma.leadStage.create({
          data: { tenantId: tid, name: s.name, displayOrder: s.displayOrder },
        });
      }
      stages = await this.prisma.leadStage.findMany({
        where: { tenantId: tid },
        orderBy: { displayOrder: 'asc' },
        include: { leads: true },
      });
    }

    return stages;
  }

  async findFirstStage(tenantId: string) {
    const tid = normalizeTenantId(tenantId);
    const stages = await this.findStages(tid);
    return stages[0] ?? null;
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
      data: {
        ...data,
        tenantId: normalizeTenantId(data.tenantId),
      },
      include: {
        stage: true,
        callLogs: true,
        notes: true,
      },
    });
  }

  async findLeads(tenantId: string) {
    const tid = normalizeTenantId(tenantId);
    let leads = await this.prisma.lead.findMany({
      where: { tenantId: tid },
      include: {
        stage: true,
        callLogs: true,
        notes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (leads.length === 0) {
      const stages = await this.findStages(tid);
      const stageMap: Record<string, string> = {};
      stages.forEach((st: any) => {
        stageMap[st.name] = st.id;
      });

      const seedData = [
        {
          title: 'Grand Summer Wedding Gala — 250 Guests',
          contactName: 'Lady Eleanor Vance',
          email: 'eleanor.vance@vancemedia.co.uk',
          phone: '+44 20 7946 0912',
          leadScore: 95,
          source: 'web_inquiry',
          stageId: stageMap['Proposal Sent'] || stages[2]?.id,
          callLogs: [
            {
              callSubject: 'Initial Ballroom & Catering Consultation',
              callDuration: 25,
              notes: 'Client confirmed Grand Crystal Ballroom booking interest for 3 days with plated dining.',
            },
          ],
          notes: [
            { noteContent: 'High-priority VIP inquiry. Referred by Group Managing Director. Fast proposal turnaround required.' },
          ],
        },
        {
          title: 'Global FinTech Executive Summit 2026',
          contactName: 'Dr. Marcus Sterling',
          email: 'm.sterling@fintechcap.com',
          phone: '+1 (415) 890-2134',
          leadScore: 92,
          source: 'ai_concierge',
          stageId: stageMap['Contract Negotiation'] || stages[3]?.id,
          callLogs: [
            {
              callSubject: 'Dedicated Fiber & Hybrid Stream Technical Review',
              callDuration: 18,
              notes: 'Confirmed 1 Gbps symmetric link requirement and simultaneous 4K streaming to 3 breakouts.',
            },
          ],
          notes: [
            { noteContent: 'Budget pre-approved by board for $38,000. Contract terms sent for digital signing.' },
          ],
        },
        {
          title: 'Luxury Island Villa Buyout Retreat',
          contactName: 'Sophia Lorenzi',
          email: 'sophia@lorenzidesign.it',
          phone: '+39 02 8765 4321',
          leadScore: 88,
          source: 'whatsapp',
          stageId: stageMap['Qualified / Discovery'] || stages[1]?.id,
          callLogs: [
            {
              callSubject: 'Beachfront Presidential Villa Inspection',
              callDuration: 14,
              notes: 'Prefers 4-villa cluster with private infinity pool and dedicated 24-hr butler service.',
            },
          ],
          notes: [
            { noteContent: 'Guest is interested in private yacht day charter as part of the package.' },
          ],
        },
        {
          title: 'Annual BioTech Innovation Dinner',
          contactName: 'Dr. Arthur Pendelton',
          email: 'arthur.p@biolabs.org',
          phone: '+1 (617) 555-0199',
          leadScore: 82,
          source: 'phone_inquiry',
          stageId: stageMap['New Inquiry'] || stages[0]?.id,
          callLogs: [
            {
              callSubject: 'Venue Availability & Pricing Query',
              callDuration: 10,
              notes: 'Inquired about Amber Garden Pavilion for 80 attendees with AV podium.',
            },
          ],
          notes: [
            { noteContent: 'Awaiting preliminary attendee list to finalize banquet course options.' },
          ],
        },
        {
          title: 'Heritage Watchmakers VIP Auction Preview',
          contactName: 'Alexander Wright',
          email: 'a.wright@genevawatch.ch',
          phone: '+41 22 555 0147',
          leadScore: 90,
          source: 'referral',
          stageId: stageMap['Closed Won'] || stages[4]?.id,
          callLogs: [
            {
              callSubject: 'Vault & Armed Security Logistics Briefing',
              callDuration: 22,
              notes: 'Security coordination finalized for high-value horology display cases.',
            },
          ],
          notes: [
            { noteContent: 'Deposit paid in full ($32,000) and contract signed.' },
          ],
        },
      ];

      for (const item of seedData) {
        const { callLogs, notes, ...leadFields } = item;
        const created = await this.prisma.lead.create({
          data: {
            ...leadFields,
            tenantId: tid,
          },
        });

        for (const cl of callLogs) {
          await this.prisma.leadCallLog.create({
            data: {
              leadId: created.id,
              callSubject: cl.callSubject,
              callDuration: cl.callDuration,
              notes: cl.notes,
            },
          });
        }

        for (const n of notes) {
          await this.prisma.leadActivityNote.create({
            data: {
              leadId: created.id,
              noteContent: n.noteContent,
            },
          });
        }
      }

      leads = await this.prisma.lead.findMany({
        where: { tenantId: tid },
        include: {
          stage: true,
          callLogs: true,
          notes: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return leads;
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
    const tid = normalizeTenantId(tenantId);
    return this.prisma.lead.count({
      where: { tenantId: tid, assignedTo: userId },
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
