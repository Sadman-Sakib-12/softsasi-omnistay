import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { ILoyaltyRepository } from '../../domain/repositories/loyalty.repository.interface.js';
import { LOYALTY_REPOSITORY_TOKEN } from '../../domain/repositories/loyalty.repository.interface.js';
import { DebitWalletDto, RefundToWalletDto, TopUpWalletDto } from '../../presentation/dto/wallet.dto.js';

@Injectable()
export class WalletApplicationService {
  constructor(
    @Inject(LOYALTY_REPOSITORY_TOKEN)
    private readonly loyaltyRepo: ILoyaltyRepository,
  ) {}

  async getOrCreateWallet(userId: string, currency = 'USD') {
    let wallet = await this.loyaltyRepo.findWalletByUserId(userId);

    if (!wallet) {
      wallet = await this.loyaltyRepo.createWallet({
        userId,
        currency,
        balance: 0,
        isLocked: false,
      });
    }

    return wallet;
  }

  async topUp(userId: string, dto: TopUpWalletDto) {
    const wallet = await this.getOrCreateWallet(userId, dto.currency);

    if (wallet.isLocked) {
      throw new BadRequestException('Wallet is locked. Please contact support.');
    }

    const updated = await this.loyaltyRepo.updateWallet(wallet.id, {
      balance: {
        increment: dto.amount,
      },
    });

    const transaction = await this.loyaltyRepo.createWalletTransaction({
      walletId: wallet.id,
      amount: dto.amount,
      type: 'deposit',
      description: dto.description || 'Digital wallet credit top-up',
    });

    return {
      wallet: updated,
      transaction,
    };
  }

  async debit(userId: string, dto: DebitWalletDto) {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.isLocked) {
      throw new BadRequestException('Wallet is locked');
    }

    if (Number(wallet.balance) < dto.amount) {
      throw new BadRequestException(
        `Insufficient wallet balance ($${wallet.balance}). Required: $${dto.amount}`,
      );
    }

    const updated = await this.loyaltyRepo.updateWallet(wallet.id, {
      balance: {
        decrement: dto.amount,
      },
    });

    const transaction = await this.loyaltyRepo.createWalletTransaction({
      walletId: wallet.id,
      amount: dto.amount,
      type: 'payment',
      referenceId: dto.referenceId,
      description: dto.description || '1-click checkout payment',
    });

    return {
      wallet: updated,
      transaction,
    };
  }

  async refund(userId: string, dto: RefundToWalletDto) {
    const wallet = await this.getOrCreateWallet(userId);

    const updated = await this.loyaltyRepo.updateWallet(wallet.id, {
      balance: {
        increment: dto.amount,
      },
    });

    const transaction = await this.loyaltyRepo.createWalletTransaction({
      walletId: wallet.id,
      amount: dto.amount,
      type: 'refund',
      referenceId: dto.referenceId,
      description: dto.description || 'Instant booking refund credit',
    });

    return {
      wallet: updated,
      transaction,
    };
  }

  async getTransactions(walletId: string) {
    return this.loyaltyRepo.findWalletTransactions(walletId);
  }
}
