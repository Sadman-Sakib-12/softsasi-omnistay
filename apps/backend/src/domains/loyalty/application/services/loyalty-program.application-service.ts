import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { ILoyaltyRepository } from '../../domain/repositories/loyalty.repository.interface.js';
import { LOYALTY_REPOSITORY_TOKEN } from '../../domain/repositories/loyalty.repository.interface.js';
import {
  calculatePointsDiscount,
  calculatePointsEarned,
} from '../../domain/rules/loyalty.rule.js';
import { CreateLoyaltyTierDto, EarnPointsDto, RedeemPointsDto } from '../../presentation/dto/loyalty.dto.js';

@Injectable()
export class LoyaltyProgramApplicationService {
  constructor(
    @Inject(LOYALTY_REPOSITORY_TOKEN)
    private readonly loyaltyRepo: ILoyaltyRepository,
  ) {}

  async createTier(dto: CreateLoyaltyTierDto) {
    return this.loyaltyRepo.createTier({
      name: dto.name,
      minPoints: dto.minPoints,
      multiplier: dto.multiplier ?? 1.0,
      perks: dto.perks,
    });
  }

  async getTiers() {
    return this.loyaltyRepo.findTiers();
  }

  async getAllMembers() {
    return this.loyaltyRepo.findAllMembers();
  }

  getCatalog() {
    return [
      {
        id: 'cat-cash-10',
        title: '$10 Direct Checkout Cash Discount',
        pointsRequired: 1000,
        cashValue: 10.0,
        category: 'Direct Folio Credit',
        description: 'Instant $10 cash deduction applied to room booking or dining checkout (1,000 pts = $10).',
      },
      {
        id: 'cat-cash-25',
        title: '$25 Direct Checkout Cash Discount',
        pointsRequired: 2500,
        cashValue: 25.0,
        category: 'Direct Folio Credit',
        description: 'Instant $25 cash deduction applied to room booking or dining checkout.',
      },
      {
        id: 'cat-spa-60',
        title: 'Free 60-Minute Deep Tissue Spa Massage',
        pointsRequired: 5000,
        cashValue: 120.0,
        category: 'Spa & Wellness',
        description: 'Relaxing holistic massage treatment at the Imperial Spa & Wellness Center.',
      },
      {
        id: 'cat-dining-sunset',
        title: '3-Course Sunset Dining Experience for Two',
        pointsRequired: 6000,
        cashValue: 160.0,
        category: 'Food & Beverage',
        description: 'Curated culinary dinner with ocean view wine pairing at Azure Fine Dining.',
      },
      {
        id: 'cat-vip-transfer',
        title: 'Complimentary VIP Airport Limousine Transfer',
        pointsRequired: 8000,
        cashValue: 200.0,
        category: 'Concierge & Transport',
        description: 'Private chauffeur luxury vehicle airport pickup or departure transfer.',
      },
      {
        id: 'cat-room-upgrade',
        title: 'Complimentary Luxury Suite Weekend Upgrade',
        pointsRequired: 10000,
        cashValue: 350.0,
        category: 'Rooms & Lodging',
        description: 'Guaranteed space-available upgrade to Panoramic Ocean Penthouse.',
      },
    ];
  }

  async getOrCreateMember(userId: string) {
    let member = await this.loyaltyRepo.findMemberByUserId(userId);

    if (!member) {
      let baseTier = await this.loyaltyRepo.findBaseTier();
      if (!baseTier) {
        baseTier = await this.loyaltyRepo.createTier({
          name: 'Bronze Explorer',
          minPoints: 0,
          multiplier: 1.0,
          perks: { description: 'Earns 1 reward point per $1 spent; member-only 5% room rate discount.' },
        });
      }

      member = await this.loyaltyRepo.createMember({
        userId,
        tierId: baseTier.id,
        points: 0,
      });
    }

    return member;
  }

  async earnPoints(userId: string, dto: EarnPointsDto) {
    const member = await this.getOrCreateMember(userId);
    const multiplier = Number(member.tier?.multiplier) || 1.0;

    // Pure domain rule evaluation
    const pointsEarned = calculatePointsEarned(dto.amountSpent, multiplier);
    const updatedPoints = member.points + pointsEarned;

    // Check eligible tier threshold
    const eligibleTier = await this.loyaltyRepo.findTierForPoints(updatedPoints);
    const newTierId = eligibleTier ? eligibleTier.id : member.tierId;

    const updatedMember = await this.loyaltyRepo.updateMember(member.id, {
      points: updatedPoints,
      tierId: newTierId,
    });

    const ledger = await this.loyaltyRepo.createPointsLedger({
      memberId: member.id,
      pointsDelta: pointsEarned,
      reason: dto.reason,
    });

    return {
      member: updatedMember,
      pointsEarned,
      ledger,
    };
  }

  async redeemPoints(userId: string, dto: RedeemPointsDto) {
    const member = await this.getOrCreateMember(userId);

    if (member.points < dto.pointsToRedeem) {
      throw new BadRequestException(
        `Insufficient points (${member.points}). Attempted to redeem ${dto.pointsToRedeem} points.`,
      );
    }

    // Pure domain rule evaluation
    const discountAmount = calculatePointsDiscount(dto.pointsToRedeem);
    const remainingPoints = member.points - dto.pointsToRedeem;

    const updatedMember = await this.loyaltyRepo.updateMember(member.id, {
      points: remainingPoints,
    });

    const ledger = await this.loyaltyRepo.createPointsLedger({
      memberId: member.id,
      pointsDelta: -dto.pointsToRedeem,
      reason: dto.reason,
    });

    return {
      member: updatedMember,
      discountAmount,
      pointsRedeemed: dto.pointsToRedeem,
      ledger,
    };
  }

  async getPointsLedger(memberId: string) {
    return this.loyaltyRepo.findPointsLedger(memberId);
  }
}
