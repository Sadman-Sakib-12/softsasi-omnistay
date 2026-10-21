import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateCommissionRate, calculateReviewAverage } from './domain/rules/commission.rule.js';
import { VendorApplicationService } from './application/services/vendor.application-service.js';
import { CommissionApplicationService } from './application/services/commission.application-service.js';
import { VendorPayoutApplicationService } from './application/services/vendor-payout.application-service.js';
import { GuestReviewApplicationService } from './application/services/guest-review.application-service.js';
import { IMarketplaceRepository } from './domain/repositories/marketplace.repository.interface.js';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('Marketplace Domain — Clean Architecture & DDD Test Suite', () => {
  describe('Domain Rules (Pure Logic)', () => {
    it('calculateCommissionRate: should apply category overrides and volume tiers', () => {
      expect(calculateCommissionRate(15.0, 'tour')).toBe(20.0);
      expect(calculateCommissionRate(15.0, 'boat')).toBe(18.0);
      expect(calculateCommissionRate(15.0, 'car')).toBe(12.0);
      expect(calculateCommissionRate(15.0, 'tour', 150000)).toBe(10.0);
      expect(calculateCommissionRate(15.0, 'hotel', 60000)).toBe(12.0);
    });

    it('calculateReviewAverage: should calculate rounded mean across dimensions', () => {
      const avg = calculateReviewAverage([
        { score: 5 },
        { score: 5 },
        { score: 4 },
        { score: 4 },
        { score: 5 },
      ]);
      expect(avg).toBe(4.6);
    });
  });

  describe('Application Services & Repository Orchestration', () => {
    let mockRepo: IMarketplaceRepository;
    let vendorService: VendorApplicationService;
    let commissionService: CommissionApplicationService;
    let payoutService: VendorPayoutApplicationService;
    let reviewService: GuestReviewApplicationService;

    beforeEach(() => {
      mockRepo = {
        createVendorPlan: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'plan-1', ...data })),
        findVendorPlans: vi.fn().mockResolvedValue([{ id: 'plan-1', planName: 'Premier Host Tier' }]),
        findVendorByUserId: vi.fn().mockImplementation((userId) =>
          userId === 'user-existing' ? Promise.resolve({ id: 'v-1', userId: 'user-existing', balance: 1500 }) : Promise.resolve(null),
        ),
        createVendor: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'v-new', ...data })),
        findVendors: vi.fn().mockResolvedValue([{ id: 'v-1', businessName: 'Azure Charters' }]),
        findVendorById: vi.fn().mockImplementation((id) =>
          id === 'v-1'
            ? Promise.resolve({
                id: 'v-1',
                commissionRate: 15.0,
                balance: 1500,
                payoutMethods: [{ id: 'pm-1', methodType: 'stripe_connect', isDefault: true }],
              })
            : Promise.resolve(null),
        ),
        createKycSubmission: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'kyc-1', ...data })),
        findKycById: vi.fn().mockImplementation((id) =>
          id === 'kyc-1' ? Promise.resolve({ id: 'kyc-1', vendorId: 'v-1', status: 'pending' }) : Promise.resolve(null),
        ),
        updateKyc: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        updateVendor: vi.fn().mockImplementation((id, data) => {
          const balance = data.balance?.increment ? 1500 + data.balance.increment : (data.balance?.decrement ? 1500 - data.balance.decrement : 1500);
          return Promise.resolve({ id, ...data, balance });
        }),
        createTeamMember: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'tm-1', ...data })),
        findTeamMembers: vi.fn().mockResolvedValue([{ id: 'tm-1', role: 'manager' }]),
        createCommission: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'comm-1', ...data })),
        findCommissions: vi.fn().mockResolvedValue([{ id: 'comm-1', commissionAmt: 150 }]),
        createPayoutMethod: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'pm-1', ...data })),
        findPayoutMethods: vi.fn().mockResolvedValue([]),
        createWithdrawal: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'w-1', ...data })),
        findWithdrawalById: vi.fn().mockImplementation((id) =>
          id === 'w-1'
            ? Promise.resolve({
                id: 'w-1',
                vendorId: 'v-1',
                amount: 500,
                status: 'requested',
                vendor: {
                  id: 'v-1',
                  payoutMethods: [{ methodType: 'stripe_connect', isDefault: true }],
                },
              })
            : Promise.resolve(null),
        ),
        updateWithdrawal: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        createPayout: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'payout-1', ...data })),
        findWithdrawals: vi.fn().mockResolvedValue([{ id: 'w-1', amount: 500 }]),
        findPayouts: vi.fn().mockResolvedValue([{ id: 'payout-1', amount: 500 }]),
        findBookingById: vi.fn().mockImplementation((bookingId) => {
          if (bookingId === 'b-cancelled') return Promise.resolve({ id: 'b-cancelled', bookingStatus: 'cancelled' });
          if (bookingId === 'b-ok') return Promise.resolve({ id: 'b-ok', bookingStatus: 'checked_out' });
          return Promise.resolve(null);
        }),
        findReviewByBookingId: vi.fn().mockResolvedValue(null),
        createReview: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'rev-1', ...data })),
        findReviewById: vi.fn().mockImplementation((id) =>
          id === 'rev-1' ? Promise.resolve({ id: 'rev-1', overallScore: 4.6 }) : Promise.resolve(null),
        ),
        createHostReply: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'rep-1', ...data })),
        findReviewsByBookings: vi.fn().mockResolvedValue([{ id: 'rev-1' }]),
      };

      vendorService = new VendorApplicationService(mockRepo);
      commissionService = new CommissionApplicationService(mockRepo);
      payoutService = new VendorPayoutApplicationService(mockRepo);
      reviewService = new GuestReviewApplicationService(mockRepo);
    });

    it('VendorApplicationService: should register host and approve KYC with verification', async () => {
      const vendor = await vendorService.registerVendor('t-1', 'user-new', {
        businessName: 'Mediterranean Charters',
      });
      expect(vendor.businessName).toBe('Mediterranean Charters');

      const kyc = await vendorService.reviewKyc('kyc-1', 'admin-1', 'verified');
      expect(kyc.status).toBe('verified');
      expect(mockRepo.updateVendor).toHaveBeenCalledWith('v-1', { isVerified: true });
    });

    it('CommissionApplicationService: should record commission and increment vendor balance', async () => {
      const res = await commissionService.calculateAndRecordCommission({
        vendorId: 'v-1',
        bookingId: 'b-100',
        grossAmount: 1000,
        vertical: 'yacht', // 18%
      });

      expect(res.appliedRate).toBe(18.0);
      expect(res.commission.commissionAmt).toBe(180);
      expect(res.commission.netVendorAmt).toBe(820);
      expect(res.updatedVendorBalance).toBe(2320);
    });

    it('VendorPayoutApplicationService: should process withdrawal with threshold checks and payout', async () => {
      const w = await payoutService.requestWithdrawal('v-1', { amount: 500 });
      expect(w.amount).toBe(500);

      const payout = await payoutService.processPayout({ withdrawalId: 'w-1' });
      expect(payout.status).toBe('completed');
      expect(payout.payoutMethod).toBe('stripe_connect');
    });

    it('GuestReviewApplicationService: should calculate overall score and enforce verified stays', async () => {
      await expect(
        reviewService.createReview({
          bookingId: 'b-cancelled',
          ratings: [{ dimension: 'Cleanliness', score: 5 }],
        }),
      ).rejects.toThrow(BadRequestException);

      const rev = await reviewService.createReview({
        bookingId: 'b-ok',
        comment: 'Great stay',
        ratings: [
          { dimension: 'Cleanliness', score: 5 },
          { dimension: 'Service', score: 4 },
        ],
      });

      expect(rev.overallScore).toBe(4.5);
    });
  });
});
