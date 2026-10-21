import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IMarketplaceRepository } from '../../domain/repositories/marketplace.repository.interface.js';
import { MARKETPLACE_REPOSITORY_TOKEN } from '../../domain/repositories/marketplace.repository.interface.js';
import {
  AddPayoutMethodDto,
  ProcessPayoutDto,
  RequestWithdrawalDto,
} from '../../presentation/dto/payout.dto.js';

@Injectable()
export class VendorPayoutApplicationService {
  constructor(
    @Inject(MARKETPLACE_REPOSITORY_TOKEN)
    private readonly marketplaceRepo: IMarketplaceRepository,
  ) {}

  async addPayoutMethod(vendorId: string, dto: AddPayoutMethodDto) {
    const existing = await this.marketplaceRepo.findPayoutMethods(vendorId);
    const isDefault = existing.length === 0;

    return this.marketplaceRepo.createPayoutMethod({
      vendorId,
      methodType: dto.methodType,
      details: dto.details,
      isDefault,
    });
  }

  async getPayoutMethods(vendorId: string) {
    return this.marketplaceRepo.findPayoutMethods(vendorId);
  }

  async requestWithdrawal(vendorId: string, dto: RequestWithdrawalDto) {
    if (dto.amount < 100) {
      throw new BadRequestException('Minimum withdrawal threshold is $100.00');
    }

    const vendor = await this.marketplaceRepo.findVendorById(vendorId);
    if (!vendor) throw new NotFoundException(`Vendor ${vendorId} not found`);

    if (Number(vendor.balance) < dto.amount) {
      throw new BadRequestException(
        `Insufficient vendor balance ($${vendor.balance}). Requested: $${dto.amount}`,
      );
    }

    // Deduct from balance
    await this.marketplaceRepo.updateVendor(vendorId, {
      balance: {
        decrement: dto.amount,
      },
    });

    return this.marketplaceRepo.createWithdrawal({
      vendorId,
      amount: dto.amount,
      status: 'requested',
    });
  }

  async processPayout(dto: ProcessPayoutDto) {
    const withdrawal = await this.marketplaceRepo.findWithdrawalById(dto.withdrawalId);
    if (!withdrawal) throw new NotFoundException(`Withdrawal ${dto.withdrawalId} not found`);

    if (withdrawal.status !== 'requested') {
      throw new BadRequestException(`Withdrawal is already in status '${withdrawal.status}'`);
    }

    const payoutMethod =
      withdrawal.vendor.payoutMethods.find((m: any) => m.isDefault) ||
      withdrawal.vendor.payoutMethods[0];

    const methodType = payoutMethod ? payoutMethod.methodType : 'direct_bank_wire';
    const reference = dto.reference || `PAYOUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payout = await this.marketplaceRepo.createPayout({
      vendorId: withdrawal.vendorId,
      amount: withdrawal.amount,
      payoutMethod: methodType,
      status: 'completed',
      reference,
      processedAt: new Date(),
    });

    await this.marketplaceRepo.updateWithdrawal(dto.withdrawalId, {
      status: 'paid',
      paidAt: new Date(),
    });

    return payout;
  }

  async getWithdrawals(vendorId: string) {
    return this.marketplaceRepo.findWithdrawals(vendorId);
  }

  async getPayouts(vendorId: string) {
    return this.marketplaceRepo.findPayouts(vendorId);
  }
}
