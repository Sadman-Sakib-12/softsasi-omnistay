import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IMarketplaceRepository } from '../../domain/repositories/marketplace.repository.interface.js';
import { MARKETPLACE_REPOSITORY_TOKEN } from '../../domain/repositories/marketplace.repository.interface.js';
import { calculateReviewAverage } from '../../domain/rules/commission.rule.js';
import { CreateGuestReviewDto, ReplyReviewDto } from '../../presentation/dto/review.dto.js';

@Injectable()
export class GuestReviewApplicationService {
  constructor(
    @Inject(MARKETPLACE_REPOSITORY_TOKEN)
    private readonly marketplaceRepo: IMarketplaceRepository,
  ) {}

  async createReview(dto: CreateGuestReviewDto) {
    // 1. Verify booking exists
    const booking = await this.marketplaceRepo.findBookingById(dto.bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking ${dto.bookingId} not found`);
    }

    // 2. Verified stay enforcement
    if (booking.bookingStatus === 'cancelled') {
      throw new BadRequestException('Cannot review a cancelled reservation');
    }

    // 3. Prevent duplicate reviews
    const existing = await this.marketplaceRepo.findReviewByBookingId(dto.bookingId);
    if (existing) {
      throw new ConflictException('A review has already been submitted for this booking');
    }

    // 4. Pure domain rule evaluation for overall score
    const overallScore = dto.ratings?.length
      ? calculateReviewAverage(dto.ratings)
      : 5.0;

    return this.marketplaceRepo.createReview({
      bookingId: dto.bookingId,
      overallScore,
      comment: dto.comment,
      isVerifiedStay: true,
      ratings: dto.ratings?.map((r) => ({
        dimension: r.dimension,
        score: r.score,
      })),
    });
  }

  async replyToReview(reviewId: string, dto: ReplyReviewDto) {
    const review = await this.marketplaceRepo.findReviewById(reviewId);
    if (!review) throw new NotFoundException(`Review ${reviewId} not found`);

    return this.marketplaceRepo.createHostReply({
      reviewId,
      replyText: dto.replyText,
    });
  }

  async getReviewById(id: string) {
    const review = await this.marketplaceRepo.findReviewById(id);
    if (!review) throw new NotFoundException(`Review ${id} not found`);
    return review;
  }

  async getReviewsForBookings(bookingIds: string[]) {
    return this.marketplaceRepo.findReviewsByBookings(bookingIds);
  }
}
