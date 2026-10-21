import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IDealRepository } from '../../domain/repositories/deal.repository.interface.js';

@Injectable()
export class PrismaDealRepository implements IDealRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createStage(data: { tenantId: string; name: string; displayOrder: number }) {
    return this.prisma.dealStage.create({ data });
  }

  async findStages(tenantId: string) {
    return this.prisma.dealStage.findMany({
      where: { tenantId },
      orderBy: { displayOrder: 'asc' },
      include: { deals: true },
    });
  }

  async findFirstStage(tenantId: string) {
    return this.prisma.dealStage.findFirst({
      where: { tenantId },
      orderBy: { displayOrder: 'asc' },
    });
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
      data,
      include: {
        stage: true,
        proposals: true,
        contracts: true,
      },
    });
  }

  async findDeals(tenantId: string) {
    return this.prisma.deal.findMany({
      where: { tenantId },
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
    return this.prisma.banquetContract.create({
      data,
      include: { signatures: true },
    });
  }

  async findContractById(id: string) {
    return this.prisma.banquetContract.findUnique({
      where: { id },
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
