import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IMarketplaceRepository } from '../../domain/repositories/marketplace.repository.interface.js';
import { MARKETPLACE_REPOSITORY_TOKEN } from '../../domain/repositories/marketplace.repository.interface.js';
import { calculateCommissionRate } from '../../domain/rules/commission.rule.js';
import { CalculateCommissionDto } from '../../presentation/dto/commission.dto.js';

@Injectable()
export class CommissionApplicationService {
  constructor(
    @Inject(MARKETPLACE_REPOSITORY_TOKEN)
    private readonly marketplaceRepo: IMarketplaceRepository,
  ) {}

  async calculateAndRecordCommission(dto: CalculateCommissionDto) {
    const vendor = await this.marketplaceRepo.findVendorById(dto.vendorId);
    if (!vendor) throw new NotFoundException(`Vendor ${dto.vendorId} not found`);

    // Pure domain rule evaluation
    const rate = calculateCommissionRate(
      Number(vendor.commissionRate),
      dto.vertical,
    );

    const grossAmount = dto.grossAmount;
    const commissionAmt = (grossAmount * rate) / 100;
    const netVendorAmt = grossAmount - commissionAmt;

    // Record commission in repository
    const commission = await this.marketplaceRepo.createCommission({
      vendorId: dto.vendorId,
      bookingId: dto.bookingId,
      grossAmount,
      commissionAmt,
      netVendorAmt,
    });

    // Credit net earnings to vendor balance
    const updatedVendor = await this.marketplaceRepo.updateVendor(dto.vendorId, {
      balance: {
        increment: netVendorAmt,
      },
    });

    return {
      commission,
      appliedRate: rate,
      updatedVendorBalance: Number(updatedVendor.balance),
    };
  }

  async getCommissionsForVendor(vendorId: string) {
    return this.marketplaceRepo.findCommissions(vendorId);
  }
}
