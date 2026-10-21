import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IMarketplaceRepository } from '../../domain/repositories/marketplace.repository.interface.js';

@Injectable()
export class PrismaMarketplaceRepository implements IMarketplaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createVendorPlan(data: { planName: string; maxListings: number; feePercent: number; monthlyFee: number }) {
    return this.prisma.vendorPlan.create({ data });
  }

  async findVendorPlans() {
    return this.prisma.vendorPlan.findMany({ orderBy: { monthlyFee: 'asc' } });
  }

  async findVendorByUserId(userId: string) {
    return this.prisma.vendor.findFirst({
      where: { userId },
      include: { payoutMethods: true, teamMembers: true, kycSubmissions: true, withdrawals: true },
    });
  }

  async createVendor(data: any) {
    return this.prisma.vendor.create({
      data,
      include: { payoutMethods: true, teamMembers: true, kycSubmissions: true },
    });
  }

  async findVendors(tenantId: string) {
    return this.prisma.vendor.findMany({
      where: { tenantId },
      include: { payoutMethods: true, teamMembers: true, kycSubmissions: true },
      orderBy: { createdAt: 'desc' },
    });
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
    return this.prisma.vendorKycSubmission.findUnique({ where: { id } });
  }

  async updateKyc(id: string, data: Record<string, any>) {
    return this.prisma.vendorKycSubmission.update({ where: { id }, data });
  }

  async updateVendor(id: string, data: Record<string, any>) {
    return this.prisma.vendor.update({ where: { id }, data });
  }

  async createTeamMember(data: any) {
    return this.prisma.vendorTeamMember.create({ data });
  }

  async findTeamMembers(vendorId: string) {
    return this.prisma.vendorTeamMember.findMany({ where: { vendorId } });
  }

  async createCommission(data: any) {
    return this.prisma.vendorCommission.create({ data });
  }

  async findCommissions(vendorId: string) {
    return this.prisma.vendorCommission.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });
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

  async findWithdrawals(vendorId: string) {
    return this.prisma.vendorWithdrawal.findMany({
      where: { vendorId },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async findPayouts(vendorId: string) {
    return this.prisma.vendorPayout.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });
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
        bookingId: data.bookingId,
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
    return this.prisma.guestReview.findMany({
      where: { bookingId: { in: bookingIds } },
      include: { ratings: true, hostReplies: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
