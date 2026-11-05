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

  async findAllProfiles(limit = 100) {
    let profiles = await this.prisma.guestProfile360.findMany({
      take: limit,
      include: {
        preferences: true,
        dietary: true,
      },
      orderBy: { lifetimeSpend: 'desc' },
    });

    if (profiles.length === 0) {
      const seedProfiles = [
        {
          userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9501',
          lifetimeSpend: 48650,
          totalNights: 42,
          vipTier: 'VIP Black',
          notes: "Chairman's Circle Member. General Manager personal greeting required upon arrival at Portico.",
          preferences: [
            { preferenceKey: 'Pillow Selection', preferenceVal: 'Goose Down Feather' },
            { preferenceKey: 'Room Temperature', preferenceVal: '20°C (68°F)' },
            { preferenceKey: 'Floor Preference', preferenceVal: 'Penthouse / Top Floor Corner' },
            { preferenceKey: 'Preferred Wine Vintage', preferenceVal: 'Château Margaux 1982' },
            { preferenceKey: 'Turndown Service', preferenceVal: 'Extra Lavender Mist & Warm Milk' },
          ],
          dietary: [
            {
              restriction: 'Severe Celiac Disease (Strict Gluten-Free Kitchen)',
              notes: 'Dedicated cookware required; anaphylaxis risk',
            },
            {
              restriction: 'Shellfish & Crustaceans Allergy',
              notes: 'No cross-contact with shrimp, crab, lobster',
            },
          ],
        },
        {
          userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9502',
          lifetimeSpend: 28400,
          totalNights: 26,
          vipTier: 'Platinum',
          notes: 'Frequent executive business traveler. Request silent floor with corner workstation.',
          preferences: [
            { preferenceKey: 'Pillow Selection', preferenceVal: 'Hypoallergenic Memory Foam' },
            { preferenceKey: 'Room Temperature', preferenceVal: '21°C (70°F)' },
            { preferenceKey: 'Morning Newspaper', preferenceVal: 'Financial Times Delivered 06:30 AM' },
            { preferenceKey: 'Coffee Preference', preferenceVal: 'Double Ristretto Oat Milk' },
          ],
          dietary: [
            {
              restriction: 'Strict Plant-Based Vegan',
              notes: 'All courses 100% plant-based',
            },
            {
              restriction: 'Lactose Intolerant',
              notes: 'Use oat or almond milk',
            },
          ],
        },
        {
          userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9503',
          lifetimeSpend: 14200,
          totalNights: 14,
          vipTier: 'Gold',
          notes: 'Prefers late check-out till 3:00 PM.',
          preferences: [
            { preferenceKey: 'Room Category', preferenceVal: 'Poolside Lagoon Villa' },
            { preferenceKey: 'Bedding', preferenceVal: 'Firm Mattress with Dual Feather Duvet' },
            { preferenceKey: 'Toiletries', preferenceVal: 'Aqua Di Parma Citrus Collection' },
          ],
          dietary: [
            {
              restriction: 'Glatt Kosher Prepared',
              notes: 'Rabbinical certified pre-packaged catering',
            },
            {
              restriction: 'Tree Nut & Peanut Allergy',
              notes: 'Severe anaphylaxis precautions',
            },
          ],
        },
        {
          userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9504',
          lifetimeSpend: 6800,
          totalNights: 6,
          vipTier: 'Silver',
          notes: 'Honeymoon anniversary couple. Complimentary champagne setup.',
          preferences: [
            { preferenceKey: 'Room Category', preferenceVal: 'Deluxe Ocean Suite' },
            { preferenceKey: 'Pillow Selection', preferenceVal: 'Soft Duck Feather' },
            { preferenceKey: 'Minibar Setup', preferenceVal: 'Diet Ginger Ale & Mineral Water Only' },
          ],
          dietary: [
            {
              restriction: 'No Pork Products (Halal Friendly)',
              notes: 'Halal certified meat only',
            },
          ],
        },
      ];

      for (const p of seedProfiles) {
        const { preferences, dietary, ...profileFields } = p;
        const created = await this.prisma.guestProfile360.upsert({
          where: { userId: p.userId },
          update: profileFields,
          create: profileFields,
        });

        for (const pref of preferences) {
          await this.prisma.guestStayPreference.create({
            data: {
              profileId: created.id,
              preferenceKey: pref.preferenceKey,
              preferenceVal: pref.preferenceVal,
            },
          });
        }

        for (const diet of dietary) {
          await this.prisma.guestDietaryRestriction.create({
            data: {
              profileId: created.id,
              restriction: diet.restriction,
              notes: diet.notes,
            },
          });
        }
      }

      profiles = await this.prisma.guestProfile360.findMany({
        take: limit,
        include: {
          preferences: true,
          dietary: true,
        },
        orderBy: { lifetimeSpend: 'desc' },
      });
    }

    return profiles;
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
        answers: data.answers
          ? {
              create: data.answers.map((a) => ({
                question: a.question,
                answerText: a.answerText,
              })),
            }
          : undefined,
      },
      include: {
        answers: true,
      },
    });
  }
}
