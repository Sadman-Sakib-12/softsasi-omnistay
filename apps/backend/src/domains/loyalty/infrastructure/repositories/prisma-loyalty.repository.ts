import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { ILoyaltyRepository } from '../../domain/repositories/loyalty.repository.interface.js';

@Injectable()
export class PrismaLoyaltyRepository implements ILoyaltyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findWalletByUserId(userId: string) {
    return this.prisma.wallet.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
  }

  async createWallet(data: any) {
    return this.prisma.wallet.create({ data, include: { transactions: true } });
  }

  async updateWallet(id: string, data: Record<string, any>) {
    return this.prisma.wallet.update({ where: { id }, data });
  }

  async createWalletTransaction(data: any) {
    return this.prisma.walletTransaction.create({ data });
  }

  async findWalletTransactions(walletId: string) {
    return this.prisma.walletTransaction.findMany({ where: { walletId }, orderBy: { createdAt: 'desc' } });
  }

  async createTier(data: any) {
    return this.prisma.loyaltyTier.create({ data });
  }

  async findTiers() {
    return this.prisma.loyaltyTier.findMany({ orderBy: { minPoints: 'asc' } });
  }

  async findBaseTier() {
    return this.prisma.loyaltyTier.findFirst({ orderBy: { minPoints: 'asc' } });
  }

  async findTierForPoints(points: number) {
    return this.prisma.loyaltyTier.findFirst({
      where: { minPoints: { lte: points } },
      orderBy: { minPoints: 'desc' },
    });
  }

  async findMemberByUserId(userId: string) {
    return this.prisma.loyaltyMember.findUnique({
      where: { userId },
      include: { tier: true, ledger: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
  }

  async createMember(data: any) {
    return this.prisma.loyaltyMember.create({ data, include: { tier: true, ledger: true } });
  }

  async updateMember(id: string, data: Record<string, any>) {
    return this.prisma.loyaltyMember.update({ where: { id }, data, include: { tier: true } });
  }

  async createPointsLedger(data: any) {
    return this.prisma.loyaltyPointsLedger.create({ data });
  }

  async findPointsLedger(memberId: string) {
    return this.prisma.loyaltyPointsLedger.findMany({ where: { memberId }, orderBy: { createdAt: 'desc' } });
  }

  async createGiftCard(data: any) {
    return this.prisma.giftCard.create({ data });
  }

  async findGiftCardByCode(code: string) {
    return this.prisma.giftCard.findUnique({ where: { code }, include: { redemptions: true } });
  }

  async updateGiftCard(id: string, data: Record<string, any>) {
    return this.prisma.giftCard.update({ where: { id }, data });
  }

  async createGiftCardRedemption(data: any) {
    return this.prisma.giftCardRedemption.create({ data });
  }

  async findGiftCardRedemptions(giftCardId: string) {
    return this.prisma.giftCardRedemption.findMany({ where: { giftCardId }, orderBy: { redeemedAt: 'desc' } });
  }

  async findReferralLinkByUserId(userId: string) {
    return this.prisma.referralLink.findFirst({ where: { userId }, include: { commissions: true } });
  }

  async findReferralLinkByCode(referralCode: string) {
    return this.prisma.referralLink.findUnique({ where: { referralCode } });
  }

  async createReferralLink(data: any) {
    return this.prisma.referralLink.create({ data, include: { commissions: true } });
  }

  async incrementReferralClicks(referralCode: string) {
    return this.prisma.referralLink.update({
      where: { referralCode },
      data: { clicksCount: { increment: 1 } },
    });
  }

  async createReferralCommission(data: any) {
    return this.prisma.referralCommission.create({ data });
  }

  async createCoupon(data: any) {
    return this.prisma.coupon.create({ data });
  }

  async findCoupons(tenantId: string) {
    return this.prisma.coupon.findMany({ where: { tenantId }, include: { usages: true }, orderBy: { createdAt: 'desc' } });
  }

  async findCouponByCode(tenantId: string, code: string) {
    return this.prisma.coupon.findUnique({ where: { tenantId_code: { tenantId, code } } });
  }

  async updateCoupon(id: string, data: Record<string, any>) {
    return this.prisma.coupon.update({ where: { id }, data });
  }

  async createCouponUsage(data: any) {
    return this.prisma.couponUsage.create({ data });
  }
}
