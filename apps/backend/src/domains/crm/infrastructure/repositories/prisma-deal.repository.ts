import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IDealRepository } from '../../domain/repositories/deal.repository.interface.js';

function normalizeTenantId(id?: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (id && uuidRegex.test(id)) return id;
  return '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525';
}

@Injectable()
export class PrismaDealRepository implements IDealRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createStage(data: { tenantId: string; name: string; displayOrder: number }) {
    return this.prisma.dealStage.create({
      data: {
        tenantId: normalizeTenantId(data.tenantId),
        name: data.name,
        displayOrder: data.displayOrder ?? 0,
      },
    });
  }

  async findStages(tenantId: string) {
    const tid = normalizeTenantId(tenantId);
    let stages = await this.prisma.dealStage.findMany({
      where: { tenantId: tid },
      orderBy: { displayOrder: 'asc' },
      include: { deals: true },
    });

    if (stages.length === 0) {
      const defaultStages = [
        { name: 'Discovery / Inquiry', displayOrder: 1 },
        { name: 'Site Inspection Scheduled', displayOrder: 2 },
        { name: 'Proposal & Banquet Menu Sent', displayOrder: 3 },
        { name: 'Contract Negotiation', displayOrder: 4 },
        { name: 'Deposit Paid / Won', displayOrder: 5 },
        { name: 'Lost', displayOrder: 6 },
      ];
      for (const s of defaultStages) {
        await this.prisma.dealStage.create({
          data: { tenantId: tid, name: s.name, displayOrder: s.displayOrder },
        });
      }
      stages = await this.prisma.dealStage.findMany({
        where: { tenantId: tid },
        orderBy: { displayOrder: 'asc' },
        include: { deals: true },
      });
    }

    return stages;
  }

  async findFirstStage(tenantId: string) {
    const tid = normalizeTenantId(tenantId);
    const stages = await this.findStages(tid);
    return stages[0] ?? null;
  }

  async createDeal(data: {
    tenantId: string;
    stageId?: string;
    dealName: string;
    dealValue: number;
    expectedClose?: Date | null;
    status: string;
  }) {
    return this.prisma.deal.create({
      data: {
        ...data,
        tenantId: normalizeTenantId(data.tenantId),
      },
      include: {
        stage: true,
        proposals: true,
        contracts: true,
      },
    });
  }

  async findDeals(tenantId: string) {
    const tid = normalizeTenantId(tenantId);
    let deals = await this.prisma.deal.findMany({
      where: { tenantId: tid },
      include: {
        stage: true,
        proposals: true,
        contracts: {
          include: { signatures: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (deals.length === 0) {
      const stages = await this.findStages(tid);
      const stageMap: Record<string, string> = {};
      stages.forEach((st: any) => {
        stageMap[st.name] = st.id;
      });

      const seedDeals = [
        {
          dealName: 'Vance-Rothschild Royal Wedding & Ballroom Buyout',
          dealValue: 65000,
          status: 'won',
          stageId: stageMap['Deposit Paid / Won'] || stages[4]?.id,
          expectedClose: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          proposal: {
            proposalRef: 'PROP-2026-001',
            amount: 65000,
            pdfUrl: '/proposals/PROP-2026-001.pdf',
            status: 'accepted',
          },
          contract: {
            contractNumber: 'CTR-2026-0089',
            termsContent:
              'OmniStay Luxury Resort Grand Ballroom Master Agreement for 250 guests including 5-course plated dinner, floral arch, and bridal suite complimentary.',
            isSigned: true,
            signature: {
              signerName: 'Lady Eleanor Vance',
              signerIp: '185.122.34.12',
              signatureImg:
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIj48dGV4dCB5PSIzMCIgZm9udC1mYW1pbHk9ImN1cnNpdmUiPkVsZWFub3IgVmFuY2U8L3RleHQ+PC9zdmc+',
            },
          },
        },
        {
          dealName: 'FinTech Global Leadership Retreat & Keynote Gala',
          dealValue: 38000,
          status: 'open',
          stageId: stageMap['Contract Negotiation'] || stages[3]?.id,
          expectedClose: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          proposal: {
            proposalRef: 'PROP-2026-002',
            amount: 38000,
            pdfUrl: '/proposals/PROP-2026-002.pdf',
            status: 'sent',
          },
          contract: {
            contractNumber: 'CTR-2026-0090',
            termsContent:
              'MICE Conference Master Agreement for 120 pax including main plenary hall, breakout rooms, and executive buffet.',
            isSigned: false,
          },
        },
        {
          dealName: 'Mediterranean Villa Buyout & Private Yacht Excursion',
          dealValue: 24500,
          status: 'open',
          stageId: stageMap['Proposal & Banquet Menu Sent'] || stages[2]?.id,
          expectedClose: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
          proposal: {
            proposalRef: 'PROP-2026-003',
            amount: 24500,
            pdfUrl: '/proposals/PROP-2026-003.pdf',
            status: 'sent',
          },
        },
        {
          dealName: 'BioTech Annual Medical Gala & Plated Dinner',
          dealValue: 18000,
          status: 'open',
          stageId: stageMap['Site Inspection Scheduled'] || stages[1]?.id,
          expectedClose: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        },
        {
          dealName: 'Geneva Haute Horlogerie Private Collectors Dinner',
          dealValue: 32000,
          status: 'open',
          stageId: stageMap['Discovery / Inquiry'] || stages[0]?.id,
          expectedClose: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
      ];

      for (const item of seedDeals) {
        const { proposal, contract, ...dealFields } = item;
        const createdDeal = await this.prisma.deal.create({
          data: {
            ...dealFields,
            tenantId: tid,
          },
        });

        if (proposal) {
          await this.prisma.dealProposal.create({
            data: {
              dealId: createdDeal.id,
              proposalRef: proposal.proposalRef,
              amount: proposal.amount,
              pdfUrl: proposal.pdfUrl,
              status: proposal.status,
            },
          });
        }

        if (contract) {
          const createdContract = await this.prisma.banquetContract.create({
            data: {
              dealId: createdDeal.id,
              contractNumber: contract.contractNumber,
              termsContent: contract.termsContent,
              isSigned: contract.isSigned,
            },
          });

          if (contract.signature) {
            await this.prisma.contractSignature.create({
              data: {
                contractId: createdContract.id,
                signerName: contract.signature.signerName,
                signerIp: contract.signature.signerIp,
                signatureImg: contract.signature.signatureImg,
              },
            });
          }
        }
      }

      deals = await this.prisma.deal.findMany({
        where: { tenantId: tid },
        include: {
          stage: true,
          proposals: true,
          contracts: {
            include: { signatures: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return deals;
  }

  async findDealById(id: string) {
    return this.prisma.deal.findUnique({
      where: { id },
      include: {
        stage: true,
        proposals: true,
        contracts: {
          include: { signatures: true },
        },
      },
    });
  }

  async updateDeal(id: string, data: Record<string, any>) {
    return this.prisma.deal.update({
      where: { id },
      data,
      include: {
        stage: true,
        proposals: true,
        contracts: true,
      },
    });
  }

  async createProposal(data: {
    dealId: string;
    proposalRef: string;
    amount: number;
    pdfUrl?: string;
    status: string;
  }) {
    return this.prisma.dealProposal.create({ data });
  }

  async createBanquetContract(data: {
    dealId: string;
    contractNumber: string;
    termsContent: string;
    isSigned: boolean;
  }) {
    return this.prisma.banquetContract.create({ data });
  }

  async findContractById(id: string) {
    return this.prisma.banquetContract.findUnique({
      where: { id },
      include: { signatures: true },
    });
  }

  async createSignature(data: {
    contractId: string;
    signerName: string;
    signerIp: string;
    signatureImg: string;
  }) {
    return this.prisma.contractSignature.create({ data });
  }

  async updateContract(id: string, data: Record<string, any>) {
    return this.prisma.banquetContract.update({
      where: { id },
      data,
    });
  }
}
