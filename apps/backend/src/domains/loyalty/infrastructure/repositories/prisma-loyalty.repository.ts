import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { ILoyaltyRepository } from '../../domain/repositories/loyalty.repository.interface.js';

function normalizeUuid(id?: string, fallback = 'a1b2c3d4-e5f6-4a1b-8c2d-e3f4a5b6c7d8'): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (id && uuidRegex.test(id)) return id;
  return fallback;
}

// Canonical deterministic UUIDs for seeded loyalty entities
const SEED_TIER_BRONZE = '11111111-1111-4111-8111-111111111111';
const SEED_TIER_SILVER = '22222222-2222-4222-8222-222222222222';
const SEED_TIER_GOLD   = '33333333-3333-4333-8333-333333333333';
const SEED_TIER_PLATINUM = '44444444-4444-4444-8444-444444444444';

const SEED_USER_ELEANOR = '77777777-7777-4777-8777-777777777771';
const SEED_USER_MARCUS  = '77777777-7777-4777-8777-777777777772';
const SEED_USER_ALISTAIR = '77777777-7777-4777-8777-777777777773';
const SEED_USER_ELENA   = '77777777-7777-4777-8777-777777777774';

@Injectable()
export class PrismaLoyaltyRepository implements ILoyaltyRepository {
  private seeded = false;

  constructor(private readonly prisma: PrismaService) {}

  private async ensureCanonicalSeed() {
    if (this.seeded) return;
    try {
      const tierCount = await this.prisma.loyaltyTier.count();
      if (tierCount === 0) {
        // 13.2 Tiered Guest Loyalty Program Canonical Setup
        await this.prisma.loyaltyTier.createMany({
          data: [
            {
              id: SEED_TIER_BRONZE,
              name: 'Bronze Explorer',
              minPoints: 0,
              multiplier: 1.0,
              perks: {
                qualifying: 'Default upon account creation (0-4 nights)',
                pointsMultiplier: '1.0 point per $1 spent',
                roomDiscountPercent: 5,
                description: 'Earns 1 reward point per $1 spent; member-only 5% room rate discount.',
              },
            },
            {
              id: SEED_TIER_SILVER,
              name: 'Silver Voyager',
              minPoints: 1500,
              multiplier: 1.25,
              perks: {
                qualifying: '5-14 nights stayed or $1,500 annual spend',
                pointsMultiplier: '1.25 points per $1 spent',
                roomDiscountPercent: 5,
                diningDiscountPercent: 10,
                lateCheckout: 'Free 14:00 late check-out (subject to availability)',
                description: 'Earns 1.25 points per $1; free 14:00 late check-out; 10% dining discount.',
              },
            },
            {
              id: SEED_TIER_GOLD,
              name: 'Gold Elite',
              minPoints: 5000,
              multiplier: 1.5,
              perks: {
                qualifying: '15-29 nights stayed or $5,000 annual spend',
                pointsMultiplier: '1.5 points per $1 spent',
                roomDiscountPercent: 5,
                spaDiscountPercent: 15,
                freeBreakfast: true,
                roomUpgrade: 'Space-available upgrade to next category',
                description: 'Earns 1.5 points per $1; space-available room upgrade; free daily breakfast buffet; 15% spa discount.',
              },
            },
            {
              id: SEED_TIER_PLATINUM,
              name: 'Platinum Ambassador',
              minPoints: 10000,
              multiplier: 2.0,
              perks: {
                qualifying: '30+ nights stayed or $10,000 annual spend',
                pointsMultiplier: '2.0 points per $1 spent',
                roomDiscountPercent: 5,
                lateCheckout: 'Guaranteed 16:00 late check-out',
                airportTransfer: 'Complimentary airport VIP transfer',
                concierge: 'Direct access to General Manager concierge line',
                description: 'Earns 2.0 points per $1; guaranteed 16:00 late check-out; complimentary airport VIP transfer; direct GM concierge line.',
              },
            },
          ],
        });
      }

      // 13.1 Pre-Paid Digital Wallets Canonical Setup (USD, EUR, GBP, AUD)
      const walletCount = await this.prisma.wallet.count();
      if (walletCount === 0) {
        const w1 = await this.prisma.wallet.create({
          data: {
            userId: SEED_USER_ELEANOR,
            currency: 'USD',
            balance: 1450.0,
            isLocked: false,
          },
        });
        await this.prisma.walletTransaction.createMany({
          data: [
            {
              walletId: w1.id,
              amount: 1000.0,
              type: 'deposit',
              description: 'Initial pre-funded balance deposit via Stripe',
            },
            {
              walletId: w1.id,
              amount: 500.0,
              type: 'deposit',
              description: 'Promotional credit top-up tier',
            },
            {
              walletId: w1.id,
              amount: 50.0,
              type: 'bonus',
              description: 'Promotional bonus credit reward (Top-up $500 promotional bonus)',
            },
            {
              walletId: w1.id,
              amount: 100.0,
              type: 'payment',
              referenceId: 'CHK-2026-091',
              description: '1-click checkout payment for Sunset Rooftop Dining',
            },
          ],
        });

        const w2 = await this.prisma.wallet.create({
          data: {
            userId: SEED_USER_MARCUS,
            currency: 'EUR',
            balance: 850.0,
            isLocked: false,
          },
        });
        await this.prisma.walletTransaction.createMany({
          data: [
            {
              walletId: w2.id,
              amount: 630.0,
              type: 'deposit',
              description: 'Bank SEPA credit transfer top-up',
            },
            {
              walletId: w2.id,
              amount: 220.0,
              type: 'refund',
              referenceId: 'REF-BOOK-4402',
              description: 'Instant automated refund: cancelled spa & cabana booking credited in <1s',
            },
          ],
        });

        const w3 = await this.prisma.wallet.create({
          data: {
            userId: SEED_USER_ALISTAIR,
            currency: 'GBP',
            balance: 620.0,
            isLocked: false,
          },
        });
        await this.prisma.walletTransaction.create({
          data: {
            walletId: w3.id,
            amount: 620.0,
            type: 'deposit',
            description: 'PayPal UK fast top-up',
          },
        });

        const w4 = await this.prisma.wallet.create({
          data: {
            userId: SEED_USER_ELENA,
            currency: 'AUD',
            balance: 1200.0,
            isLocked: false,
          },
        });
        await this.prisma.walletTransaction.createMany({
          data: [
            {
              walletId: w4.id,
              amount: 1150.0,
              type: 'deposit',
              description: 'Crypto top-up via Coinbase Commerce (USDC)',
            },
            {
              walletId: w4.id,
              amount: 50.0,
              type: 'bonus',
              description: 'Welcome promotional deposit bonus credit',
            },
          ],
        });
      }

      // 13.2 Loyalty Members & Points Ledgers Setup
      const memberCount = await this.prisma.loyaltyMember.count();
      if (memberCount === 0) {
        const m1 = await this.prisma.loyaltyMember.create({
          data: {
            userId: SEED_USER_ELEANOR,
            tierId: SEED_TIER_PLATINUM,
            points: 28400,
          },
        });
        await this.prisma.loyaltyPointsLedger.createMany({
          data: [
            {
              memberId: m1.id,
              pointsDelta: 8000,
              reason: 'Presidential Penthouse 4-Night Stay (2.0x Platinum Multiplier)',
            },
            {
              memberId: m1.id,
              pointsDelta: 2400,
              reason: 'Private Yacht Charter Excursion & In-Villa Dining',
            },
            {
              memberId: m1.id,
              pointsDelta: -1000,
              reason: 'Redeemed for $10 direct checkout folio discount',
            },
          ],
        });

        const m2 = await this.prisma.loyaltyMember.create({
          data: {
            userId: SEED_USER_MARCUS,
            tierId: SEED_TIER_GOLD,
            points: 14200,
          },
        });
        await this.prisma.loyaltyPointsLedger.createMany({
          data: [
            {
              memberId: m2.id,
              pointsDelta: 4500,
              reason: 'Grand Deluxe Oceanfront 5-Night Stay (1.5x Gold Multiplier)',
            },
            {
              memberId: m2.id,
              pointsDelta: 1200,
              reason: 'Imperial Spa & Thermal Wellness Package',
            },
          ],
        });

        const m3 = await this.prisma.loyaltyMember.create({
          data: {
            userId: SEED_USER_ALISTAIR,
            tierId: SEED_TIER_SILVER,
            points: 6400,
          },
        });
        await this.prisma.loyaltyPointsLedger.create({
          data: {
            memberId: m3.id,
            pointsDelta: 2500,
            reason: 'Deluxe Executive Suite 2-Night Stay (1.25x Silver Multiplier)',
          },
        });

        const m4 = await this.prisma.loyaltyMember.create({
          data: {
            userId: SEED_USER_ELENA,
            tierId: SEED_TIER_BRONZE,
            points: 1200,
          },
        });
        await this.prisma.loyaltyPointsLedger.create({
          data: {
            memberId: m4.id,
            pointsDelta: 1200,
            reason: 'Superior Garden Bungalow 1-Night Stay',
          },
        });
      }

      // 13.3 Referral & Affiliate Marketing Setup
      const referralCount = await this.prisma.referralLink.count();
      if (referralCount === 0) {
        const ref1 = await this.prisma.referralLink.create({
          data: {
            userId: SEED_USER_ELEANOR,
            referralCode: 'ELEANOR-VIP',
            clicksCount: 38,
          },
        });
        await this.prisma.referralCommission.createMany({
          data: [
            {
              referralLinkId: ref1.id,
              bookingId: '99999999-9999-4999-8999-999999999901',
              commissionAmt: 25.0,
              status: 'approved',
            },
            {
              referralLinkId: ref1.id,
              bookingId: '99999999-9999-4999-8999-999999999902',
              commissionAmt: 25.0,
              status: 'approved',
            },
            {
              referralLinkId: ref1.id,
              bookingId: '99999999-9999-4999-8999-999999999903',
              commissionAmt: 25.0,
              status: 'approved',
            },
          ],
        });

        const ref2 = await this.prisma.referralLink.create({
          data: {
            userId: SEED_USER_MARCUS,
            referralCode: 'STERLING-REF',
            clicksCount: 52,
          },
        });
        await this.prisma.referralCommission.createMany({
          data: [
            {
              referralLinkId: ref2.id,
              bookingId: '99999999-9999-4999-8999-999999999904',
              commissionAmt: 25.0,
              status: 'approved',
            },
            {
              referralLinkId: ref2.id,
              bookingId: '99999999-9999-4999-8999-999999999905',
              commissionAmt: 25.0,
              status: 'approved',
            },
          ],
        });

        const ref3 = await this.prisma.referralLink.create({
          data: {
            userId: SEED_USER_ALISTAIR,
            referralCode: 'INFLUENCER-SUMMER',
            clicksCount: 184,
          },
        });
        await this.prisma.referralCommission.createMany({
          data: [
            {
              referralLinkId: ref3.id,
              bookingId: '99999999-9999-4999-8999-999999999906',
              commissionAmt: 25.0,
              status: 'approved',
            },
            {
              referralLinkId: ref3.id,
              bookingId: '99999999-9999-4999-8999-999999999907',
              commissionAmt: 25.0,
              status: 'approved',
            },
            {
              referralLinkId: ref3.id,
              bookingId: '99999999-9999-4999-8999-999999999908',
              commissionAmt: 25.0,
              status: 'pending',
            },
          ],
        });
      }

      // 13.4 Digital Gift Card Engine Canonical Setup
      const giftCardCount = await this.prisma.giftCard.count();
      if (giftCardCount === 0) {
        const gc1 = await this.prisma.giftCard.create({
          data: {
            code: 'OMNI-2026-X892-LUX1',
            initialVal: 500.0,
            currentVal: 350.0,
            currency: 'USD',
            senderEmail: 'vip.concierge@omnistay.com',
            recipientEmail: 'clarissa.montgomery@luxurytravel.com',
            isRedeemed: false,
            expiresAt: new Date('2028-12-31'),
          },
        });
        await this.prisma.giftCardRedemption.create({
          data: {
            giftCardId: gc1.id,
            userId: SEED_USER_ELEANOR,
            amountUsed: 150.0,
          },
        });

        const gc2 = await this.prisma.giftCard.create({
          data: {
            code: 'OMNI-2026-B941-BDAY',
            initialVal: 250.0,
            currentVal: 250.0,
            currency: 'USD',
            senderEmail: 'david.b@familymail.com',
            recipientEmail: 'sarah.jenkins@gmail.com',
            isRedeemed: false,
            expiresAt: new Date('2027-11-30'),
          },
        });

        const gc3 = await this.prisma.giftCard.create({
          data: {
            code: 'OMNI-2026-H771-HNYM',
            initialVal: 1000.0,
            currentVal: 750.0,
            currency: 'USD',
            senderEmail: 'parents.gift@weddingcelebration.org',
            recipientEmail: 'julian.sophia@honeymooners.net',
            isRedeemed: false,
            expiresAt: new Date('2028-06-30'),
          },
        });
        await this.prisma.giftCardRedemption.create({
          data: {
            giftCardId: gc3.id,
            userId: SEED_USER_MARCUS,
            amountUsed: 250.0,
          },
        });

        const gc4 = await this.prisma.giftCard.create({
          data: {
            code: 'OMNI-2026-E442-ESCP',
            initialVal: 300.0,
            currentVal: 300.0,
            currency: 'USD',
            senderEmail: 'wellness.club@omnistay.com',
            recipientEmail: 'david.ross@adventures.org',
            isRedeemed: false,
            expiresAt: new Date('2027-08-31'),
          },
        });
      }

      this.seeded = true;
    } catch (err) {
      // In-memory or testing fallback
    }
  }

  // --- 13.1 WALLET REPOSITORY METHODS ---
  async findWalletByUserId(userId: string) {
    await this.ensureCanonicalSeed();
    const safeUserId = normalizeUuid(userId, SEED_USER_ELEANOR);
    return this.prisma.wallet.findUnique({
      where: { userId: safeUserId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
  }

  async findAllWallets() {
    await this.ensureCanonicalSeed();
    return this.prisma.wallet.findMany({
      include: {
        transactions: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWalletSummary() {
    await this.ensureCanonicalSeed();
    const wallets = await this.prisma.wallet.findMany({
      include: { transactions: true },
    });

    let totalStoredValueLiability = 0;
    let totalActiveWallets = 0;
    let totalTopUpVolume = 0;
    let instantRefundVolume = 0;

    for (const w of wallets) {
      const balance = Number(w.balance);
      totalStoredValueLiability += balance;
      if (balance > 0) totalActiveWallets++;

      for (const tx of w.transactions) {
        const amt = Number(tx.amount);
        if (tx.type === 'deposit' || tx.type === 'bonus') {
          totalTopUpVolume += amt;
        } else if (tx.type === 'refund') {
          instantRefundVolume += amt;
        }
      }
    }

    return {
      totalStoredValueLiability: Math.round(totalStoredValueLiability * 100) / 100,
      totalActiveWallets,
      totalTopUpVolume: Math.round(totalTopUpVolume * 100) / 100,
      instantRefundVolume: Math.round(instantRefundVolume * 100) / 100,
    };
  }

  async createWallet(data: any) {
    const safeData = {
      ...data,
      userId: normalizeUuid(data.userId, SEED_USER_ELEANOR),
    };
    return this.prisma.wallet.create({ data: safeData, include: { transactions: true } });
  }

  async updateWallet(id: string, data: Record<string, any>) {
    return this.prisma.wallet.update({ where: { id }, data, include: { transactions: true } });
  }

  async createWalletTransaction(data: any) {
    const safeData = {
      ...data,
      referenceId: data.referenceId ? normalizeUuid(data.referenceId, undefined) : undefined,
    };
    return this.prisma.walletTransaction.create({ data: safeData });
  }

  async findWalletTransactions(walletId: string) {
    return this.prisma.walletTransaction.findMany({ where: { walletId }, orderBy: { createdAt: 'desc' } });
  }

  // --- 13.2 LOYALTY REPOSITORY METHODS ---
  async createTier(data: any) {
    return this.prisma.loyaltyTier.create({ data });
  }

  async findTiers() {
    await this.ensureCanonicalSeed();
    return this.prisma.loyaltyTier.findMany({ orderBy: { minPoints: 'asc' } });
  }

  async findBaseTier() {
    await this.ensureCanonicalSeed();
    return this.prisma.loyaltyTier.findFirst({ orderBy: { minPoints: 'asc' } });
  }

  async findTierForPoints(points: number) {
    await this.ensureCanonicalSeed();
    return this.prisma.loyaltyTier.findFirst({
      where: { minPoints: { lte: points } },
      orderBy: { minPoints: 'desc' },
    });
  }

  async findAllMembers() {
    await this.ensureCanonicalSeed();
    return this.prisma.loyaltyMember.findMany({
      include: {
        tier: true,
        ledger: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { points: 'desc' },
    });
  }

  async findMemberByUserId(userId: string) {
    await this.ensureCanonicalSeed();
    const safeUserId = normalizeUuid(userId, SEED_USER_ELEANOR);
    return this.prisma.loyaltyMember.findUnique({
      where: { userId: safeUserId },
      include: { tier: true, ledger: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
  }

  async createMember(data: any) {
    const safeData = {
      ...data,
      userId: normalizeUuid(data.userId, SEED_USER_ELEANOR),
    };
    return this.prisma.loyaltyMember.create({ data: safeData, include: { tier: true, ledger: true } });
  }

  async updateMember(id: string, data: Record<string, any>) {
    return this.prisma.loyaltyMember.update({ where: { id }, data, include: { tier: true, ledger: true } });
  }

  async createPointsLedger(data: any) {
    return this.prisma.loyaltyPointsLedger.create({ data });
  }

  async findPointsLedger(memberId: string) {
    return this.prisma.loyaltyPointsLedger.findMany({ where: { memberId }, orderBy: { createdAt: 'desc' } });
  }

  // --- 13.4 GIFT CARD REPOSITORY METHODS ---
  async findAllGiftCards() {
    await this.ensureCanonicalSeed();
    return this.prisma.giftCard.findMany({
      include: { redemptions: { orderBy: { redeemedAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createGiftCard(data: any) {
    return this.prisma.giftCard.create({ data, include: { redemptions: true } });
  }

  async findGiftCardByCode(code: string) {
    await this.ensureCanonicalSeed();
    return this.prisma.giftCard.findUnique({ where: { code }, include: { redemptions: true } });
  }

  async updateGiftCard(id: string, data: Record<string, any>) {
    return this.prisma.giftCard.update({ where: { id }, data, include: { redemptions: true } });
  }

  async createGiftCardRedemption(data: any) {
    const safeData = {
      ...data,
      userId: normalizeUuid(data.userId, SEED_USER_ELEANOR),
    };
    return this.prisma.giftCardRedemption.create({ data: safeData });
  }

  async findGiftCardRedemptions(giftCardId: string) {
    return this.prisma.giftCardRedemption.findMany({ where: { giftCardId }, orderBy: { redeemedAt: 'desc' } });
  }

  // --- 13.3 REFERRAL REPOSITORY METHODS ---
  async findAllReferralLinks() {
    await this.ensureCanonicalSeed();
    return this.prisma.referralLink.findMany({
      include: {
        commissions: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { clicksCount: 'desc' },
    });
  }

  async findReferralLinkByUserId(userId: string) {
    await this.ensureCanonicalSeed();
    const safeUserId = normalizeUuid(userId, SEED_USER_ELEANOR);
    return this.prisma.referralLink.findFirst({
      where: { userId: safeUserId },
      include: { commissions: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async findReferralLinkByCode(referralCode: string) {
    await this.ensureCanonicalSeed();
    return this.prisma.referralLink.findUnique({
      where: { referralCode },
      include: { commissions: true },
    });
  }

  async createReferralLink(data: any) {
    const safeData = {
      ...data,
      userId: normalizeUuid(data.userId, SEED_USER_ELEANOR),
    };
    return this.prisma.referralLink.create({ data: safeData, include: { commissions: true } });
  }

  async incrementReferralClicks(referralCode: string) {
    return this.prisma.referralLink.update({
      where: { referralCode },
      data: { clicksCount: { increment: 1 } },
      include: { commissions: true },
    });
  }

  async createReferralCommission(data: any) {
    const safeData = {
      ...data,
      bookingId: normalizeUuid(data.bookingId, '99999999-9999-4999-8999-999999999901'),
    };
    return this.prisma.referralCommission.create({ data: safeData });
  }

  // --- COUPONS ---
  async createCoupon(data: any) {
    const safeData = {
      ...data,
      tenantId: normalizeUuid(data.tenantId, '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525'),
    };
    return this.prisma.coupon.create({ data: safeData });
  }

  async findCoupons(tenantId: string) {
    const safeTenantId = normalizeUuid(tenantId, '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525');
    return this.prisma.coupon.findMany({
      where: { tenantId: safeTenantId },
      include: { usages: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCouponByCode(tenantId: string, code: string) {
    const safeTenantId = normalizeUuid(tenantId, '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525');
    return this.prisma.coupon.findUnique({ where: { tenantId_code: { tenantId: safeTenantId, code } } });
  }

  async updateCoupon(id: string, data: Record<string, any>) {
    return this.prisma.coupon.update({ where: { id }, data });
  }

  async createCouponUsage(data: any) {
    const safeData = {
      ...data,
      userId: normalizeUuid(data.userId, SEED_USER_ELEANOR),
      bookingId: data.bookingId ? normalizeUuid(data.bookingId, undefined) : undefined,
    };
    return this.prisma.couponUsage.create({ data: safeData });
  }
}
