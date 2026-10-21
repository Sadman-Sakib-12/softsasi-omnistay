import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ILoyaltyRepository } from '../../domain/repositories/loyalty.repository.interface.js';
import { LOYALTY_REPOSITORY_TOKEN } from '../../domain/repositories/loyalty.repository.interface.js';
import { randomBytes } from 'crypto';
import { GenerateReferralLinkDto, RewardReferralBookingDto } from '../../presentation/dto/referral.dto.js';
import { WalletApplicationService } from './wallet.application-service.js';

@Injectable()
export class ReferralApplicationService {
  constructor(
    @Inject(LOYALTY_REPOSITORY_TOKEN)
    private readonly loyaltyRepo: ILoyaltyRepository,
    private readonly walletService: WalletApplicationService,
  ) {}

  async getOrCreateReferralLink(userId: string, dto?: GenerateReferralLinkDto) {
    let link = await this.loyaltyRepo.findReferralLinkByUserId(userId);

    if (!link) {
      const code = dto?.customCode
        ? dto.customCode.toUpperCase()
        : `REF-${randomBytes(3).toString('hex').toUpperCase()}`;

      link = await this.loyaltyRepo.createReferralLink({
        userId,
        referralCode: code,
        clicksCount: 0,
      });
    }

    return link;
  }

  async recordClick(referralCode: string) {
    const link = await this.loyaltyRepo.findReferralLinkByCode(referralCode);
    if (!link) throw new NotFoundException(`Referral code ${referralCode} not found`);

    return this.loyaltyRepo.incrementReferralClicks(referralCode);
  }

  async rewardReferralBooking(dto: RewardReferralBookingDto) {
    const link = await this.loyaltyRepo.findReferralLinkByCode(dto.referralCode);
    if (!link) throw new NotFoundException(`Referral code ${dto.referralCode} not found`);

    const rewardAmount = dto.rewardAmount ?? 25.0;

    // Record commission
    const commission = await this.loyaltyRepo.createReferralCommission({
      referralLinkId: link.id,
      bookingId: dto.bookingId,
      commissionAmt: rewardAmount,
      status: 'approved',
    });

    // Credit reward to referrer's digital wallet via application service
    await this.walletService.topUp(link.userId, {
      amount: rewardAmount,
      description: `Referral bonus reward for booking ${dto.bookingId}`,
    });

    return {
      commission,
      rewardAmount,
      referrerUserId: link.userId,
    };
  }

  async getReferralStats(userId: string) {
    const link = await this.loyaltyRepo.findReferralLinkByUserId(userId);
    if (!link) return null;

    const totalEarned = (link.commissions || []).reduce(
      (sum: number, c: any) => sum + Number(c.commissionAmt),
      0,
    );

    return {
      referralCode: link.referralCode,
      clicksCount: link.clicksCount,
      totalReferrals: link.commissions ? link.commissions.length : 0,
      totalEarned,
      commissions: link.commissions || [],
    };
  }
}
