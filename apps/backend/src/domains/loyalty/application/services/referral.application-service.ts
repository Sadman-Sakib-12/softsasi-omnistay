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

  async getAllReferralLinks() {
    const links = await this.loyaltyRepo.findAllReferralLinks();
    return links.map((link) => {
      const commissions = link.commissions || [];
      const totalCommissions = commissions.reduce(
        (sum: number, c: any) => sum + Number(c.commissionAmt),
        0,
      );
      const conversionRate =
        link.clicksCount > 0
          ? Math.round((commissions.length / link.clicksCount) * 10000) / 100
          : 0;

      return {
        ...link,
        totalCommissions,
        convertedBookings: commissions.length,
        conversionRate,
        trackingUrl: `https://omnistay.com/book?ref=${link.referralCode}`,
        qrCodePayload: `omnistay://referral?code=${link.referralCode}`,
      };
    });
  }

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

    return {
      ...link,
      trackingUrl: `https://omnistay.com/book?ref=${link.referralCode}`,
      qrCodePayload: `omnistay://referral?code=${link.referralCode}`,
      incentiveTerms: 'Double-sided referral: Friend receives $25 off first booking; you receive $25 wallet credit upon completion of stay.',
    };
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

    // Record commission record in ledger
    const commission = await this.loyaltyRepo.createReferralCommission({
      referralLinkId: link.id,
      bookingId: dto.bookingId,
      commissionAmt: rewardAmount,
      status: 'approved',
    });

    // Credit $25 reward to referrer's digital wallet directly
    await this.walletService.topUp(link.userId, {
      amount: rewardAmount,
      description: `Double-sided referral bonus credit ($25 reward for booking ${dto.bookingId})`,
    });

    return {
      commission,
      rewardAmount,
      referrerUserId: link.userId,
      referredGuestDiscount: 25.0,
      message: 'Double-sided referral completed: $25 credited to referrer wallet, $25 discount applied to guest booking.',
    };
  }

  async getReferralStats(userId: string) {
    const link = await this.loyaltyRepo.findReferralLinkByUserId(userId);
    if (!link) return null;

    const commissions = link.commissions || [];
    const totalEarned = commissions.reduce(
      (sum: number, c: any) => sum + Number(c.commissionAmt),
      0,
    );
    const conversionRate =
      link.clicksCount > 0
        ? Math.round((commissions.length / link.clicksCount) * 10000) / 100
        : 0;

    return {
      referralCode: link.referralCode,
      trackingUrl: `https://omnistay.com/book?ref=${link.referralCode}`,
      clicksCount: link.clicksCount,
      totalReferrals: commissions.length,
      conversionRate,
      totalEarned,
      commissions,
    };
  }
}
