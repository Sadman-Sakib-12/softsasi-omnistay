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

  async getOrCreateMember(userId: string) {
    let member = await this.loyaltyRepo.findMemberByUserId(userId);

    if (!member) {
      let baseTier = await this.loyaltyRepo.findBaseTier();
      if (!baseTier) {
        baseTier = await this.loyaltyRepo.createTier({
          name: 'Bronze Explorer',
          minPoints: 0,
          multiplier: 1.0,
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
    const multiplier = Number(member.tier.multiplier) || 1.0;

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
