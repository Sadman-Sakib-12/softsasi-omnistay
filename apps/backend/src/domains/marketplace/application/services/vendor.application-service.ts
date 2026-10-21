import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IMarketplaceRepository } from '../../domain/repositories/marketplace.repository.interface.js';
import { MARKETPLACE_REPOSITORY_TOKEN } from '../../domain/repositories/marketplace.repository.interface.js';
import {
  AddVendorTeamMemberDto,
  CreateVendorPlanDto,
  RegisterVendorDto,
  SubmitKycDto,
} from '../../presentation/dto/vendor.dto.js';

@Injectable()
export class VendorApplicationService {
  constructor(
    @Inject(MARKETPLACE_REPOSITORY_TOKEN)
    private readonly marketplaceRepo: IMarketplaceRepository,
  ) {}

  async createVendorPlan(dto: CreateVendorPlanDto) {
    return this.marketplaceRepo.createVendorPlan({
      planName: dto.planName,
      maxListings: dto.maxListings ?? 10,
      feePercent: dto.feePercent ?? 15.0,
      monthlyFee: dto.monthlyFee ?? 0,
    });
  }

  async getVendorPlans() {
    return this.marketplaceRepo.findVendorPlans();
  }

  async registerVendor(tenantId: string, userId: string, dto: RegisterVendorDto) {
    const existing = await this.marketplaceRepo.findVendorByUserId(userId);
    if (existing) {
      throw new ConflictException('User already has a registered host/vendor profile');
    }

    return this.marketplaceRepo.createVendor({
      tenantId,
      userId,
      businessName: dto.businessName,
      taxId: dto.taxId,
      commissionRate: dto.commissionRate ?? 15.0,
      balance: 0,
      status: 'active',
      isVerified: false,
    });
  }

  async getVendors(tenantId: string) {
    return this.marketplaceRepo.findVendors(tenantId);
  }

  async getVendorById(id: string) {
    const vendor = await this.marketplaceRepo.findVendorById(id);
    if (!vendor) throw new NotFoundException(`Vendor ${id} not found`);
    return vendor;
  }

  async getVendorByUserId(userId: string) {
    const vendor = await this.marketplaceRepo.findVendorByUserId(userId);
    if (!vendor) throw new NotFoundException(`No vendor profile for user ${userId}`);
    return vendor;
  }

  async submitKyc(vendorId: string, dto: SubmitKycDto) {
    await this.getVendorById(vendorId);
    return this.marketplaceRepo.createKycSubmission({
      vendorId,
      documentType: dto.documentType,
      documentUrl: dto.documentUrl,
      status: 'pending',
    });
  }

  async reviewKyc(kycId: string, adminUserId: string, status: 'verified' | 'rejected') {
    const kyc = await this.marketplaceRepo.findKycById(kycId);
    if (!kyc) throw new NotFoundException(`KYC submission ${kycId} not found`);

    const updated = await this.marketplaceRepo.updateKyc(kycId, {
      status,
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
    });

    if (status === 'verified') {
      await this.marketplaceRepo.updateVendor(kyc.vendorId, { isVerified: true });
    }

    return updated;
  }

  async addTeamMember(vendorId: string, dto: AddVendorTeamMemberDto) {
    await this.getVendorById(vendorId);
    return this.marketplaceRepo.createTeamMember({
      vendorId,
      userId: dto.userId,
      role: dto.role,
    });
  }

  async getTeamMembers(vendorId: string) {
    await this.getVendorById(vendorId);
    return this.marketplaceRepo.findTeamMembers(vendorId);
  }
}
