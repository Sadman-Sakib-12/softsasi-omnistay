import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IGuest360Repository } from '../../domain/repositories/guest360.repository.interface.js';
import { GUEST360_REPOSITORY_TOKEN } from '../../domain/repositories/guest360.repository.interface.js';
import { determineVipTier } from '../../domain/rules/vip-tier.rule.js';
import {
  AddDietaryRestrictionDto,
  AddStayPreferenceDto,
  SubmitPostStaySurveyDto,
  UpdateGuestProfile360Dto,
} from '../../presentation/dto/guest360.dto.js';

@Injectable()
export class Guest360ApplicationService {
  constructor(
    @Inject(GUEST360_REPOSITORY_TOKEN)
    private readonly guestRepo: IGuest360Repository,
  ) {}

  async getOrCreateProfile(userId: string) {
    let profile = await this.guestRepo.findProfileByUserId(userId);

    if (!profile) {
      profile = await this.guestRepo.createProfile({
        userId,
        lifetimeSpend: 0,
        totalNights: 0,
        vipTier: 'Silver',
      });
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateGuestProfile360Dto) {
    await this.getOrCreateProfile(userId);
    return this.guestRepo.updateProfile(userId, {
      vipTier: dto.vipTier,
      notes: dto.notes,
    });
  }

  async recordStayAndSpend(userId: string, nights: number, spend: number) {
    const profile = await this.getOrCreateProfile(userId);
    const updatedSpend = Number(profile.lifetimeSpend) + spend;
    const updatedNights = profile.totalNights + nights;

    // Pure domain rule evaluation
    const newTier = determineVipTier(updatedNights, updatedSpend);

    return this.guestRepo.updateProfile(userId, {
      lifetimeSpend: updatedSpend,
      totalNights: updatedNights,
      vipTier: newTier,
    });
  }

  async addStayPreference(userId: string, dto: AddStayPreferenceDto) {
    const profile = await this.getOrCreateProfile(userId);
    return this.guestRepo.addPreference({
      profileId: profile.id,
      preferenceKey: dto.preferenceKey,
      preferenceVal: dto.preferenceVal,
    });
  }

  async addDietaryRestriction(userId: string, dto: AddDietaryRestrictionDto) {
    const profile = await this.getOrCreateProfile(userId);
    return this.guestRepo.addDietary({
      profileId: profile.id,
      restriction: dto.restriction,
      notes: dto.notes,
    });
  }

  async submitPostStaySurvey(dto: SubmitPostStaySurveyDto) {
    return this.guestRepo.createSurvey({
      bookingId: dto.bookingId,
      ratingScore: dto.ratingScore,
      comments: dto.comments,
      answers: dto.answers,
    });
  }
}
