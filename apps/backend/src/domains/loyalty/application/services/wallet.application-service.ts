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

  async getSummary() {
    return this.loyaltyRepo.getWalletSummary();
  }

  async getAllWallets() {
    return this.loyaltyRepo.findAllWallets();
  }

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

    // Chapter 13.1 Promotional Bonus Engine: Top-up $500, receive $50 bonus credit
    const bonusCredit = dto.amount >= 500 ? Math.floor(dto.amount / 500) * 50 : 0;
    const totalCredit = dto.amount + bonusCredit;

    const updated = await this.loyaltyRepo.updateWallet(wallet.id, {
      balance: {
        increment: totalCredit,
      },
    });

    const depositTx = await this.loyaltyRepo.createWalletTransaction({
      walletId: wallet.id,
      amount: dto.amount,
      type: 'deposit',
      description: dto.description || `Pre-paid digital wallet credit top-up (${dto.currency || 'USD'})`,
    });

    let bonusTx = null;
    if (bonusCredit > 0) {
      bonusTx = await this.loyaltyRepo.createWalletTransaction({
        walletId: wallet.id,
        amount: bonusCredit,
        type: 'bonus',
        description: `Promotional bonus credit ($50 bonus per $500 top-up milestone)`,
      });
    }

    return {
      wallet: updated,
      transaction: depositTx,
      bonusCredit,
      bonusTransaction: bonusTx,
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
      description: dto.description || '1-click checkout payment (zero 3D-secure gateway latency)',
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
      description: dto.description || 'Instant automated cancellation refund (<1s turnaround)',
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
