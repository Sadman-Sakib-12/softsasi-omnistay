import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ILoyaltyRepository } from '../../domain/repositories/loyalty.repository.interface.js';
import { LOYALTY_REPOSITORY_TOKEN } from '../../domain/repositories/loyalty.repository.interface.js';
import { generateGiftCardCode } from '../../domain/rules/loyalty.rule.js';
import { IssueGiftCardDto, RedeemGiftCardDto } from '../../presentation/dto/giftcard.dto.js';

@Injectable()
export class GiftCardApplicationService {
  constructor(
    @Inject(LOYALTY_REPOSITORY_TOKEN)
    private readonly loyaltyRepo: ILoyaltyRepository,
  ) {}

  async issueGiftCard(dto: IssueGiftCardDto) {
    // Pure domain rule code generation
    const code = generateGiftCardCode();

    return this.loyaltyRepo.createGiftCard({
      code,
      initialVal: dto.amount,
      currentVal: dto.amount,
      currency: dto.currency || 'USD',
      recipientEmail: dto.recipientEmail,
      senderEmail: dto.senderEmail,
      isRedeemed: false,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
  }

  async checkBalance(code: string) {
    const card = await this.loyaltyRepo.findGiftCardByCode(code);
    if (!card) throw new NotFoundException(`Gift card with code ${code} not found`);

    const isExpired = card.expiresAt && new Date() > card.expiresAt;

    return {
      code: card.code,
      initialVal: Number(card.initialVal),
      currentVal: Number(card.currentVal),
      currency: card.currency,
      isRedeemed: card.isRedeemed,
      isExpired: Boolean(isExpired),
      expiresAt: card.expiresAt,
    };
  }

  async redeemGiftCard(userId: string, dto: RedeemGiftCardDto) {
    const card = await this.loyaltyRepo.findGiftCardByCode(dto.code);
    if (!card) throw new NotFoundException(`Gift card with code ${dto.code} not found`);

    if (card.isRedeemed || Number(card.currentVal) <= 0) {
      throw new BadRequestException('Gift card is fully redeemed');
    }

    if (card.expiresAt && new Date() > card.expiresAt) {
      throw new BadRequestException('Gift card has expired');
    }

    if (Number(card.currentVal) < dto.amount) {
      throw new BadRequestException(
        `Insufficient gift card balance ($${card.currentVal}). Requested: $${dto.amount}`,
      );
    }

    const remainingVal = Number(card.currentVal) - dto.amount;
    const isNowRedeemed = remainingVal <= 0;

    const updatedCard = await this.loyaltyRepo.updateGiftCard(card.id, {
      currentVal: remainingVal,
      isRedeemed: isNowRedeemed,
    });

    const redemption = await this.loyaltyRepo.createGiftCardRedemption({
      giftCardId: card.id,
      userId,
      amountUsed: dto.amount,
    });

    return {
      card: updatedCard,
      redemption,
      remainingBalance: remainingVal,
    };
  }

  async getRedemptions(giftCardId: string) {
    return this.loyaltyRepo.findGiftCardRedemptions(giftCardId);
  }
}
