export const DEAL_REPOSITORY_TOKEN = Symbol('IDealRepository');

export interface IDealRepository {
  createStage(data: { tenantId: string; name: string; displayOrder: number }): Promise<any>;
  findStages(tenantId: string): Promise<any[]>;
  findFirstStage(tenantId: string): Promise<any | null>;
  createDeal(data: {
    tenantId: string;
    stageId?: string;
    dealName: string;
    dealValue: number;
    expectedClose?: Date | null;
    status: string;
  }): Promise<any>;
  findDeals(tenantId: string): Promise<any[]>;
  findDealById(id: string): Promise<any | null>;
  updateDeal(id: string, data: Record<string, any>): Promise<any>;
  createProposal(data: {
    dealId: string;
    proposalRef: string;
    amount: number;
    pdfUrl?: string;
    status: string;
  }): Promise<any>;
  createBanquetContract(data: {
    dealId: string;
    contractNumber: string;
    termsContent: string;
    isSigned: boolean;
  }): Promise<any>;
  findContractById(id: string): Promise<any | null>;
  createSignature(data: {
    contractId: string;
    signerName: string;
    signerIp: string;
    signatureImg: string;
  }): Promise<any>;
  updateContract(id: string, data: Record<string, any>): Promise<any>;
}
