import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculatePointsDiscount,
  calculatePointsEarned,
  evaluateCouponDiscount,
  generateGiftCardCode,
} from './domain/rules/loyalty.rule.js';
import { WalletApplicationService } from './application/services/wallet.application-service.js';
import { LoyaltyProgramApplicationService } from './application/services/loyalty-program.application-service.js';
import { GiftCardApplicationService } from './application/services/giftcard.application-service.js';
import { ReferralApplicationService } from './application/services/referral.application-service.js';
import { CouponApplicationService } from './application/services/coupon.application-service.js';
import { ILoyaltyRepository } from './domain/repositories/loyalty.repository.interface.js';
import { BadRequestException } from '@nestjs/common';

describe('Loyalty Domain — Clean Architecture & DDD Test Suite', () => {
  describe('Domain Rules (Pure Logic)', () => {
    it('calculatePointsEarned & discount: should calculate points and cash discount', () => {
      expect(calculatePointsEarned(200, 1.5)).toBe(300);
      expect(calculatePointsDiscount(1000)).toBe(10.0);
    });

    it('generateGiftCardCode: should generate 16-character code with GFT prefix', () => {
      const code = generateGiftCardCode();
      expect(code).toMatch(/^GFT-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/);
    });

    it('evaluateCouponDiscount: should handle percentage and fixed reductions', () => {
      expect(evaluateCouponDiscount(200, 'percentage', 20)).toBe(40.0);
      expect(evaluateCouponDiscount(200, 'fixed', 50)).toBe(50.0);
    });
  });

  describe('Application Services & Repository Orchestration', () => {
    let mockRepo: ILoyaltyRepository;
    let walletService: WalletApplicationService;
    let loyaltyService: LoyaltyProgramApplicationService;
    let giftCardService: GiftCardApplicationService;
    let referralService: ReferralApplicationService;
    let couponService: CouponApplicationService;

    beforeEach(() => {
      mockRepo = {
        findWalletByUserId: vi.fn().mockImplementation((userId) => {
          if (userId === 'user-funded') return Promise.resolve({ id: 'w-1', userId: 'user-funded', balance: 500, isLocked: false });
          if (userId === 'user-locked') return Promise.resolve({ id: 'w-locked', userId: 'user-locked', balance: 500, isLocked: true });
          return Promise.resolve(null);
        }),
        createWallet: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'w-new', ...data })),
        updateWallet: vi.fn().mockImplementation((id, data) => {
          const balance = data.balance?.increment ? 500 + data.balance.increment : (data.balance?.decrement ? 500 - data.balance.decrement : 500);
          return Promise.resolve({ id, ...data, balance });
        }),
        createWalletTransaction: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'tx-1', ...data })),
        findWalletTransactions: vi.fn().mockResolvedValue([{ id: 'tx-1', amount: 100 }]),
        createTier: vi.fn().mockImplementation((data) => Promise.resolve({ id: 't-1', ...data })),
        findTiers: vi.fn().mockResolvedValue([{ id: 't-1', name: 'Bronze Explorer' }]),
        findBaseTier: vi.fn().mockResolvedValue({ id: 'tier-bronze', name: 'Bronze Explorer', minPoints: 0, multiplier: 1.0 }),
        findTierForPoints: vi.fn().mockImplementation((points) => {
          if (points >= 5000) return Promise.resolve({ id: 'tier-gold', name: 'Gold Elite', minPoints: 5000, multiplier: 1.5 });
          return Promise.resolve({ id: 'tier-bronze', name: 'Bronze Explorer', minPoints: 0, multiplier: 1.0 });
        }),
        findMemberByUserId: vi.fn().mockImplementation((userId) => {
          if (userId === 'user-loyal') {
            return Promise.resolve({
              id: 'm-1',
              userId: 'user-loyal',
              points: 4800,
              tierId: 'tier-bronze',
              tier: { id: 'tier-bronze', name: 'Bronze Explorer', multiplier: 1.0 },
            });
          }
          return Promise.resolve(null);
        }),
        createMember: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'm-new', ...data, tier: { multiplier: 1.0 } })),
        updateMember: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        createPointsLedger: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'l-1', ...data })),
        findPointsLedger: vi.fn().mockResolvedValue([{ id: 'l-1', pointsDelta: 300 }]),
        createGiftCard: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'gc-1', ...data })),
        findGiftCardByCode: vi.fn().mockImplementation((code) => {
          if (code === 'GFT-VALID-100') {
            return Promise.resolve({
              id: 'gc-1',
              code: 'GFT-VALID-100',
              initialVal: 100,
              currentVal: 100,
              currency: 'USD',
              isRedeemed: false,
              expiresAt: new Date('2028-01-01'),
            });
          }
          return Promise.resolve(null);
        }),
        updateGiftCard: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        createGiftCardRedemption: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'gcr-1', ...data })),
        findGiftCardRedemptions: vi.fn().mockResolvedValue([]),
        findReferralLinkByUserId: vi.fn().mockImplementation((userId) =>
          userId === 'user-referrer'
            ? Promise.resolve({ id: 'ref-1', userId: 'user-referrer', referralCode: 'REF-SUMMER26', clicksCount: 12, commissions: [{ commissionAmt: 25 }] })
            : Promise.resolve(null),
        ),
        findReferralLinkByCode: vi.fn().mockImplementation((code) =>
          code === 'REF-SUMMER26' ? Promise.resolve({ id: 'ref-1', userId: 'user-referrer', referralCode: 'REF-SUMMER26' }) : Promise.resolve(null),
        ),
        createReferralLink: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'ref-1', ...data, commissions: [] })),
        incrementReferralClicks: vi.fn().mockImplementation((code) => Promise.resolve({ referralCode: code, clicksCount: 13 })),
        createReferralCommission: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'rc-1', ...data })),
        createCoupon: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'cpn-1', ...data })),
        findCoupons: vi.fn().mockResolvedValue([{ id: 'cpn-1', code: 'SAVE20' }]),
        findCouponByCode: vi.fn().mockImplementation((tenantId, code) => {
          if (code === 'SAVE20') {
            return Promise.resolve({
              id: 'cpn-save20',
              code: 'SAVE20',
              discountType: 'percentage',
              discountValue: 20.0,
              minSpend: 100.0,
              maxRedemptions: 50,
              usedCount: 5,
              validFrom: new Date('2026-01-01'),
              validUntil: new Date('2027-01-01'),
              isActive: true,
            });
          }
          return Promise.resolve(null);
        }),
        updateCoupon: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        createCouponUsage: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'cpu-1', ...data })),
      };

      walletService = new WalletApplicationService(mockRepo);
      loyaltyService = new LoyaltyProgramApplicationService(mockRepo);
      giftCardService = new GiftCardApplicationService(mockRepo);
      referralService = new ReferralApplicationService(mockRepo, walletService);
      couponService = new CouponApplicationService(mockRepo);
    });

    it('WalletApplicationService: should top up and debit wallet with balance checks', async () => {
      const res = await walletService.topUp('user-funded', { amount: 200 });
      expect(res.wallet.balance).toBe(700);

      await expect(
        walletService.debit('user-funded', { amount: 1000, referenceId: 'ref-1' }),
      ).rejects.toThrow(BadRequestException);

      const debitRes = await walletService.debit('user-funded', { amount: 100, referenceId: 'ref-1' });
      expect(debitRes.wallet.balance).toBe(400);
    });

    it('LoyaltyProgramApplicationService: should advance tier when points cross threshold', async () => {
      const res = await loyaltyService.earnPoints('user-loyal', {
        amountSpent: 300,
        reason: '3 nights stay',
      });
      expect(res.pointsEarned).toBe(300);
      expect(res.member.tierId).toBe('tier-gold');
    });

    it('GiftCardApplicationService: should issue card and support partial redemption', async () => {
      const card = await giftCardService.issueGiftCard({
        amount: 250,
        recipientEmail: 'friend@omnistay.com',
      });
      expect(card.code).toMatch(/^GFT-/);

      const red = await giftCardService.redeemGiftCard('user-1', {
        code: 'GFT-VALID-100',
        amount: 30,
      });
      expect(red.remainingBalance).toBe(70);
    });

    it('ReferralApplicationService: should reward booking by topping up referrer wallet', async () => {
      const res = await referralService.rewardReferralBooking({
        referralCode: 'REF-SUMMER26',
        bookingId: 'book-refer-101',
      });
      expect(res.rewardAmount).toBe(25.0);
      expect(mockRepo.updateWallet).toHaveBeenCalled();
    });

    it('CouponApplicationService: should calculate coupon discount and reject below min spend', async () => {
      await expect(
        couponService.validateCoupon('t-1', { code: 'SAVE20', subtotal: 50 }),
      ).rejects.toThrow(BadRequestException);

      const val = await couponService.validateCoupon('t-1', { code: 'SAVE20', subtotal: 200 });
      expect(val.discountAmount).toBe(40.0);
    });
  });
});
