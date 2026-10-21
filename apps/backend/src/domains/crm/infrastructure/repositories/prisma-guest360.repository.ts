import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IGuest360Repository } from '../../domain/repositories/guest360.repository.interface.js';

@Injectable()
export class PrismaGuest360Repository implements IGuest360Repository {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileByUserId(userId: string) {
    return this.prisma.guestProfile360.findUnique({
      where: { userId },
      include: {
        preferences: true,
        dietary: true,
      },
    });
  }

  async createProfile(data: {
    userId: string;
    lifetimeSpend: number;
    totalNights: number;
    vipTier: string;
  }) {
    return this.prisma.guestProfile360.create({
      data,
      include: {
        preferences: true,
        dietary: true,
      },
    });
  }

  async updateProfile(userId: string, data: Record<string, any>) {
    return this.prisma.guestProfile360.update({
      where: { userId },
      data,
      include: {
        preferences: true,
        dietary: true,
      },
    });
  }

  async addPreference(data: { profileId: string; preferenceKey: string; preferenceVal: string }) {
    return this.prisma.guestStayPreference.create({ data });
  }

  async addDietary(data: { profileId: string; restriction: string; notes?: string }) {
    return this.prisma.guestDietaryRestriction.create({ data });
  }

  async createSurvey(data: {
    bookingId: string;
    ratingScore: number;
    comments?: string;
    answers?: Array<{ question: string; answerText: string }>;
  }) {
    return this.prisma.postStaySurvey.create({
      data: {
        bookingId: data.bookingId,
        ratingScore: data.ratingScore,
        comments: data.comments,
        answers: data.answers?.length
          ? {
              create: data.answers.map((a) => ({
                question: a.question,
                answerText: a.answerText,
              })),
            }
          : undefined,
      },
      include: { answers: true },
    });
  }
}
