import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IMarketplaceRepository } from '../../domain/repositories/marketplace.repository.interface.js';

function normalizeUuid(id?: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (id && uuidRegex.test(id)) return id;
  return '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525';
}

@Injectable()
export class PrismaMarketplaceRepository implements IMarketplaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createVendorPlan(data: { planName: string; maxListings: number; feePercent: number; monthlyFee: number }) {
    return this.prisma.vendorPlan.create({ data });
  }

  async findVendorPlans() {
    let plans = await this.prisma.vendorPlan.findMany({ orderBy: { monthlyFee: 'asc' } });
    if (plans.length === 0) {
      await this.prisma.vendorPlan.createMany({
        data: [
          {
            planName: 'Standard Host / Direct Lister (Chapter 12.2)',
            maxListings: 10,
            feePercent: 15.0,
            monthlyFee: 0,
          },
          {
            planName: 'Premier Boutique Operator (Chapter 12.2)',
            maxListings: 50,
            feePercent: 12.0,
            monthlyFee: 99.0,
          },
          {
            planName: 'Enterprise Travel Fleet & Global OTA (Chapter 12.2)',
            maxListings: 200,
            feePercent: 10.0,
            monthlyFee: 299.0,
          },
        ],
      });
      plans = await this.prisma.vendorPlan.findMany({ orderBy: { monthlyFee: 'asc' } });
    }
    return plans;
  }

  async findVendorByUserId(userId: string) {
    const uid = normalizeUuid(userId);
    return this.prisma.vendor.findFirst({
      where: { userId: uid },
      include: { payoutMethods: true, teamMembers: true, kycSubmissions: true, withdrawals: true },
    });
  }

  async createVendor(data: any) {
    return this.prisma.vendor.create({
      data: {
        ...data,
        tenantId: normalizeUuid(data.tenantId),
        userId: normalizeUuid(data.userId),
      },
      include: { payoutMethods: true, teamMembers: true, kycSubmissions: true },
    });
  }

  async findVendors(tenantId: string) {
    const tid = normalizeUuid(tenantId);
    let vendors = await this.prisma.vendor.findMany({
      where: { tenantId: tid },
      include: { payoutMethods: true, teamMembers: true, kycSubmissions: true, withdrawals: true },
      orderBy: { createdAt: 'desc' },
    });

    if (vendors.length === 0) {
      await this.seedDefaultMarketplace(tid);
      vendors = await this.prisma.vendor.findMany({
        where: { tenantId: tid },
        include: { payoutMethods: true, teamMembers: true, kycSubmissions: true, withdrawals: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return vendors;
  }

  async findVendorById(id: string) {
    return this.prisma.vendor.findUnique({
      where: { id },
      include: {
        payoutMethods: true,
        teamMembers: true,
        kycSubmissions: true,
        withdrawals: true,
        commissions: true,
      },
    });
  }

  async createKycSubmission(data: any) {
    return this.prisma.vendorKycSubmission.create({ data });
  }

  async findKycById(id: string) {
    return this.prisma.vendorKycSubmission.findUnique({ where: { id }, include: { vendor: true } });
  }

  async findKycSubmissions(filter?: { status?: string }) {
    const where: any = {};
    if (filter?.status) {
      where.status = filter.status;
    }
    let submissions = await this.prisma.vendorKycSubmission.findMany({
      where,
      include: {
        vendor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (submissions.length === 0) {
      await this.findVendors('55c3849e-0fa3-4b52-9c2d-b4cbe23e9525');
      submissions = await this.prisma.vendorKycSubmission.findMany({
        where,
        include: {
          vendor: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return submissions;
  }

  async updateKyc(id: string, data: Record<string, any>) {
    return this.prisma.vendorKycSubmission.update({ where: { id }, data });
  }

  async updateVendor(id: string, data: Record<string, any>) {
    return this.prisma.vendor.update({ where: { id }, data });
  }

  async createTeamMember(data: any) {
    return this.prisma.vendorTeamMember.create({
      data: {
        ...data,
        userId: normalizeUuid(data.userId),
      },
    });
  }

  async findTeamMembers(vendorId: string) {
    return this.prisma.vendorTeamMember.findMany({ where: { vendorId } });
  }

  async createCommission(data: any) {
    return this.prisma.vendorCommission.create({
      data: {
        ...data,
        bookingId: normalizeUuid(data.bookingId),
      },
    });
  }

  async findCommissions(vendorId?: string) {
    const where: any = {};
    if (vendorId) where.vendorId = vendorId;

    let commissions = await this.prisma.vendorCommission.findMany({
      where,
      include: { vendor: true },
      orderBy: { createdAt: 'desc' },
    });

    if (commissions.length === 0) {
      await this.findVendors('55c3849e-0fa3-4b52-9c2d-b4cbe23e9525');
      commissions = await this.prisma.vendorCommission.findMany({
        where,
        include: { vendor: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return commissions;
  }

  async createPayoutMethod(data: any) {
    return this.prisma.vendorPayoutMethod.create({ data });
  }

  async findPayoutMethods(vendorId: string) {
    return this.prisma.vendorPayoutMethod.findMany({ where: { vendorId } });
  }

  async createWithdrawal(data: any) {
    return this.prisma.vendorWithdrawal.create({ data });
  }

  async findWithdrawalById(id: string) {
    return this.prisma.vendorWithdrawal.findUnique({
      where: { id },
      include: { vendor: { include: { payoutMethods: true } } },
    });
  }

  async updateWithdrawal(id: string, data: Record<string, any>) {
    return this.prisma.vendorWithdrawal.update({ where: { id }, data });
  }

  async createPayout(data: any) {
    return this.prisma.vendorPayout.create({ data });
  }

  async findWithdrawals(vendorId?: string) {
    const where: any = {};
    if (vendorId) where.vendorId = vendorId;

    let withdrawals = await this.prisma.vendorWithdrawal.findMany({
      where,
      include: { vendor: true },
      orderBy: { requestedAt: 'desc' },
    });

    if (withdrawals.length === 0) {
      await this.findVendors('55c3849e-0fa3-4b52-9c2d-b4cbe23e9525');
      withdrawals = await this.prisma.vendorWithdrawal.findMany({
        where,
        include: { vendor: true },
        orderBy: { requestedAt: 'desc' },
      });
    }

    return withdrawals;
  }

  async findPayouts(vendorId?: string) {
    const where: any = {};
    if (vendorId) where.vendorId = vendorId;

    let payouts = await this.prisma.vendorPayout.findMany({
      where,
      include: { vendor: true },
      orderBy: { createdAt: 'desc' },
    });

    if (payouts.length === 0) {
      await this.findVendors('55c3849e-0fa3-4b52-9c2d-b4cbe23e9525');
      payouts = await this.prisma.vendorPayout.findMany({
        where,
        include: { vendor: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return payouts;
  }

  async findBookingById(bookingId: string) {
    return this.prisma.booking.findUnique({ where: { id: bookingId } });
  }

  async findReviewByBookingId(bookingId: string) {
    return this.prisma.guestReview.findUnique({ where: { bookingId } });
  }

  async createReview(data: {
    bookingId: string;
    overallScore: number;
    comment?: string;
    isVerifiedStay: boolean;
    ratings?: Array<{ dimension: string; score: number }>;
  }) {
    return this.prisma.guestReview.create({
      data: {
        bookingId: normalizeUuid(data.bookingId),
        overallScore: data.overallScore,
        comment: data.comment,
        isVerifiedStay: data.isVerifiedStay,
        ratings: data.ratings?.length
          ? {
              create: data.ratings.map((r) => ({
                dimension: r.dimension,
                score: r.score,
              })),
            }
          : undefined,
      },
      include: { ratings: true, hostReplies: true },
    });
  }

  async findReviewById(id: string) {
    return this.prisma.guestReview.findUnique({
      where: { id },
      include: { ratings: true, hostReplies: true },
    });
  }

  async createHostReply(data: { reviewId: string; replyText: string }) {
    return this.prisma.reviewHostReply.create({ data });
  }

  async findReviewsByBookings(bookingIds: string[]) {
    const where: any = {};
    if (bookingIds && bookingIds.length > 0) {
      where.bookingId = { in: bookingIds.map(normalizeUuid) };
    }
    let reviews = await this.prisma.guestReview.findMany({
      where,
      include: { ratings: true, hostReplies: true },
      orderBy: { createdAt: 'desc' },
    });

    if (reviews.length === 0) {
      await this.seedDefaultReviews();
      reviews = await this.prisma.guestReview.findMany({
        where,
        include: { ratings: true, hostReplies: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return reviews;
  }

  /**
   * Enterprise Multi-Vendor & Host Marketplace Seeding (Chapter 12)
   */
  private async seedDefaultMarketplace(tenantId: string) {
    // 1. Ensure Plans
    await this.findVendorPlans();

    // 2. Seed 5 Multi-Vertical Vendors
    const seedVendors = [
      {
        userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9801',
        businessName: 'Azure Coastal Charters & Luxury Yachts (Chapter 12.1)',
        taxId: 'US-EIN-984210',
        isVerified: true,
        commissionRate: 18.0,
        balance: 14250.0,
        status: 'active',
        payoutMethod: {
          methodType: 'stripe_connect',
          details: { accountId: 'acct_1N92X4AZURE', country: 'US', currency: 'usd' },
        },
        kycDocs: [
          {
            documentType: 'Maritime Commercial Charter Operating License',
            documentUrl: '/kyc/maritime_charter_cert.pdf',
            status: 'verified',
          },
          {
            documentType: 'Government Passport & Tax ID Verification',
            documentUrl: '/kyc/passport_azure_owner.pdf',
            status: 'verified',
          },
        ],
        team: [
          { userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9901', role: 'Property Manager' },
          { userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9902', role: 'Cleaner / Housekeeper' },
        ],
      },
      {
        userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9802',
        businessName: 'Santorini Caldera Boutique Villas (Chapter 12.1)',
        taxId: 'EL-094182941',
        isVerified: true,
        commissionRate: 15.0,
        balance: 28400.0,
        status: 'active',
        payoutMethod: {
          methodType: 'bank_wire',
          details: {
            iban: 'GR14 0110 1250 0000 1234 5678 901',
            swift: 'ETHNGRAA',
            bankName: 'National Bank of Greece',
          },
        },
        kycDocs: [
          {
            documentType: 'Commercial Property Ownership Deed & Title',
            documentUrl: '/kyc/deed_santorini.pdf',
            status: 'verified',
          },
          {
            documentType: 'Hellenic Chamber of Hotels Operating Permit',
            documentUrl: '/kyc/permit_hellenic.pdf',
            status: 'verified',
          },
        ],
        team: [
          { userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9903', role: 'Property Manager' },
          { userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9904', role: 'Front Desk / Check-In Staff' },
        ],
      },
      {
        userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9803',
        businessName: 'Swiss Alpine Adventures & Heli-Ski Tours (Chapter 12.1)',
        taxId: 'CHE-102.394.821',
        isVerified: true,
        commissionRate: 20.0,
        balance: 9800.0,
        status: 'active',
        payoutMethod: {
          methodType: 'bank_wire',
          details: {
            iban: 'CH93 0076 2011 6238 5295 7',
            swift: 'UBSWCHZH',
            bankName: 'UBS Switzerland AG',
          },
        },
        kycDocs: [
          {
            documentType: 'Federal Mountain Guide & Heli-Ski Operator License',
            documentUrl: '/kyc/swiss_mountain_guide.pdf',
            status: 'verified',
          },
        ],
        team: [{ userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9905', role: 'Property Manager' }],
      },
      {
        userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9804',
        businessName: 'Monaco Prestige Supercar & Exotic Fleet (Chapter 12.1)',
        taxId: 'FR-849201948',
        isVerified: true,
        commissionRate: 12.0,
        balance: 19600.0,
        status: 'active',
        payoutMethod: {
          methodType: 'paypal',
          details: { email: 'disbursement@rivieraexotic.mc' },
        },
        kycDocs: [
          {
            documentType: 'Commercial Fleet Transport Insurance & License',
            documentUrl: '/kyc/fleet_transport_license.pdf',
            status: 'verified',
          },
        ],
        team: [
          { userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9906', role: 'Property Manager' },
          { userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9907', role: 'Cleaner / Housekeeper' },
        ],
      },
      {
        userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9805',
        businessName: 'Bali Eco-Bamboo Sanctuary Retreats (Chapter 12.1)',
        taxId: 'ID-992104921',
        isVerified: false,
        commissionRate: 15.0,
        balance: 3200.0,
        status: 'pending',
        payoutMethod: {
          methodType: 'bank_wire',
          details: { bankName: 'Bank Central Asia', accountNo: '8820192410' },
        },
        kycDocs: [
          {
            documentType: 'Government Passport / National ID',
            documentUrl: '/kyc/passport_ubud.pdf',
            status: 'pending',
          },
          {
            documentType: 'Hospitality Operating License & Environmental Permit',
            documentUrl: '/kyc/hotel_license_ubud.pdf',
            status: 'pending',
          },
        ],
        team: [{ userId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9908', role: 'Property Manager' }],
      },
    ];

    for (const sv of seedVendors) {
      const { payoutMethod, kycDocs, team, ...vendorFields } = sv;
      const created = await this.prisma.vendor.create({
        data: {
          ...vendorFields,
          tenantId,
        },
      });

      if (payoutMethod) {
        await this.prisma.vendorPayoutMethod.create({
          data: {
            vendorId: created.id,
            methodType: payoutMethod.methodType,
            details: payoutMethod.details,
            isDefault: true,
          },
        });
      }

      for (const kyc of kycDocs) {
        await this.prisma.vendorKycSubmission.create({
          data: {
            vendorId: created.id,
            documentType: kyc.documentType,
            documentUrl: kyc.documentUrl,
            status: kyc.status,
            reviewedAt: kyc.status === 'verified' ? new Date() : null,
          },
        });
      }

      for (const tm of team) {
        await this.prisma.vendorTeamMember.create({
          data: {
            vendorId: created.id,
            userId: tm.userId,
            role: tm.role,
          },
        });
      }

      // Seed commissions and withdrawals for the first 3 vendors
      if (created.isVerified) {
        await this.prisma.vendorCommission.create({
          data: {
            vendorId: created.id,
            bookingId: normalizeUuid(`55c3849e-0fa3-4b52-9c2d-${Date.now().toString().slice(-12)}`),
            grossAmount: created.commissionRate.toNumber() === 18 ? 4500 : 8200,
            commissionAmt: created.commissionRate.toNumber() === 18 ? 810 : 1230,
            netVendorAmt: created.commissionRate.toNumber() === 18 ? 3690 : 6970,
          },
        });

        const withdrawal = await this.prisma.vendorWithdrawal.create({
          data: {
            vendorId: created.id,
            amount: 5000,
            status: 'paid',
            paidAt: new Date(),
          },
        });

        await this.prisma.vendorPayout.create({
          data: {
            vendorId: created.id,
            amount: 5000,
            payoutMethod: payoutMethod.methodType,
            status: 'completed',
            reference: `PAYOUT-${created.id.slice(0, 6)}-${Date.now().toString().slice(-4)}`,
            processedAt: new Date(),
          },
        });
      }
    }
  }

  private async seedDefaultReviews() {
    const defaultReviews = [
      {
        bookingId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9701',
        overallScore: 4.8,
        comment:
          'Unbelievable sunset cruise along the Amalfi coast. The crew was impeccable and catered to our dietary requirements seamlessly.',
        isVerifiedStay: true,
        ratings: [
          { dimension: 'Cleanliness', score: 5 },
          { dimension: 'Location', score: 5 },
          { dimension: 'Service / Hospitality', score: 5 },
          { dimension: 'Amenities', score: 4 },
          { dimension: 'Value for Money', score: 5 },
        ],
        replyText:
          'Thank you Lady Eleanor! It was a true pleasure hosting your celebration onboard. We look forward to welcoming you back to the Mediterranean next summer.',
      },
      {
        bookingId: '55c3849e-0fa3-4b52-9c2d-b4cbe23e9702',
        overallScore: 4.9,
        comment:
          'The private infinity pool overlooking the caldera in Oia was breathtaking. Butler service was genuine 5-star perfection.',
        isVerifiedStay: true,
        ratings: [
          { dimension: 'Cleanliness', score: 5 },
          { dimension: 'Location', score: 5 },
          { dimension: 'Service / Hospitality', score: 5 },
          { dimension: 'Amenities', score: 5 },
          { dimension: 'Value for Money', score: 5 },
        ],
        replyText:
          'We are delighted your anniversary stay was magical. Safe travels and warm regards from the entire Caldera team in Santorini!',
      },
    ];

    for (const dr of defaultReviews) {
      const { ratings, replyText, ...reviewFields } = dr;
      const created = await this.prisma.guestReview.create({
        data: {
          ...reviewFields,
          ratings: {
            create: ratings,
          },
        },
      });

      if (replyText) {
        await this.prisma.reviewHostReply.create({
          data: {
            reviewId: created.id,
            replyText,
          },
        });
      }
    }
  }
}
