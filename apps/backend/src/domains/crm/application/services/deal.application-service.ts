import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IDealRepository } from '../../domain/repositories/deal.repository.interface.js';
import { DEAL_REPOSITORY_TOKEN } from '../../domain/repositories/deal.repository.interface.js';
import {
  CreateBanquetContractDto,
  CreateDealDto,
  CreateDealProposalDto,
  CreateDealStageDto,
  SignContractDto,
} from '../../presentation/dto/deal.dto.js';

@Injectable()
export class DealApplicationService {
  constructor(
    @Inject(DEAL_REPOSITORY_TOKEN)
    private readonly dealRepo: IDealRepository,
  ) {}

  async createStage(tenantId: string, dto: CreateDealStageDto) {
    return this.dealRepo.createStage({
      tenantId,
      name: dto.name,
      displayOrder: dto.displayOrder ?? 0,
    });
  }

  async getStages(tenantId: string) {
    return this.dealRepo.findStages(tenantId);
  }

  async createDeal(tenantId: string, dto: CreateDealDto) {
    let stageId = dto.stageId;
    if (!stageId) {
      const defaultStage = await this.dealRepo.findFirstStage(tenantId);
      stageId = defaultStage?.id;
    }

    return this.dealRepo.createDeal({
      tenantId,
      stageId,
      dealName: dto.dealName,
      dealValue: dto.dealValue,
      expectedClose: dto.expectedClose ? new Date(dto.expectedClose) : null,
      status: dto.status ?? 'open',
    });
  }

  async getDeals(tenantId: string) {
    return this.dealRepo.findDeals(tenantId);
  }

  async getDealById(id: string) {
    const deal = await this.dealRepo.findDealById(id);
    if (!deal) throw new NotFoundException(`Deal ${id} not found`);
    return deal;
  }

  async updateDealStatus(id: string, status: string) {
    await this.getDealById(id);
    return this.dealRepo.updateDeal(id, { status });
  }

  async createProposal(dealId: string, dto: CreateDealProposalDto) {
    await this.getDealById(dealId);
    return this.dealRepo.createProposal({
      dealId,
      proposalRef: dto.proposalRef,
      amount: dto.amount,
      pdfUrl: dto.pdfUrl,
      status: 'draft',
    });
  }

  async createBanquetContract(dealId: string, dto: CreateBanquetContractDto) {
    await this.getDealById(dealId);
    return this.dealRepo.createBanquetContract({
      dealId,
      contractNumber: dto.contractNumber,
      termsContent: dto.termsContent,
      isSigned: false,
    });
  }

  async signContract(contractId: string, dto: SignContractDto) {
    const contract = await this.dealRepo.findContractById(contractId);
    if (!contract) throw new NotFoundException(`Contract ${contractId} not found`);

    const signature = await this.dealRepo.createSignature({
      contractId,
      signerName: dto.signerName,
      signerIp: dto.signerIp,
      signatureImg: dto.signatureImg,
    });

    await this.dealRepo.updateContract(contractId, { isSigned: true });

    return signature;
  }
}
