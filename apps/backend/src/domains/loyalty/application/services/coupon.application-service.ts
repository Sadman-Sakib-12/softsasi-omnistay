import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { ILoyaltyRepository } from '../../domain/repositories/loyalty.repository.interface.js';
import { LOYALTY_REPOSITORY_TOKEN } from '../../domain/repositories/loyalty.repository.interface.js';
import { evaluateCouponDiscount } from '../../domain/rules/loyalty.rule.js';
import { CreateCouponDto, ValidateCouponDto } from '../../presentation/dto/coupon.dto.js';

@Injectable()
export class CouponApplicationService {
  constructor(
    @Inject(LOYALTY_REPOSITORY_TOKEN)
    private readonly loyaltyRepo: ILoyaltyRepository,
  ) {}

  async createCoupon(tenantId: string, dto: CreateCouponDto) {
    return this.loyaltyRepo.createCoupon({
      tenantId,
      code: dto.code.toUpperCase(),
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minSpend: dto.minSpend,
      maxRedemptions: dto.maxRedemptions,
      validFrom: new Date(dto.validFrom),
      validUntil: new Date(dto.validUntil),
      isActive: dto.isActive ?? true,
    });
  }

  async getCoupons(tenantId: string) {
    return this.loyaltyRepo.findCoupons(tenantId);
  }

  async validateCoupon(tenantId: string, dto: ValidateCouponDto) {
    const coupon = await this.loyaltyRepo.findCouponByCode(tenantId, dto.code.toUpperCase());

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException(`Coupon code '${dto.code}' is invalid or expired`);
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      throw new BadRequestException(`Coupon code '${dto.code}' is outside of its active validity period`);
    }

    if (coupon.maxRedemptions && coupon.usedCount >= coupon.maxRedemptions) {
      throw new BadRequestException(`Coupon code '${dto.code}' has reached maximum total redemptions`);
    }

    if (coupon.minSpend && dto.subtotal < Number(coupon.minSpend)) {
      throw new BadRequestException(
        `Minimum spend of $${coupon.minSpend} required to use coupon '${dto.code}'. Current: $${dto.subtotal}`,
      );
    }

    // Pure domain rule evaluation
    const discount = evaluateCouponDiscount(
      dto.subtotal,
      coupon.discountType,
      Number(coupon.discountValue),
    );

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountAmount: discount,
      subtotalAfterDiscount: Math.max(0, dto.subtotal - discount),
    };
  }

  async applyCoupon(
    tenantId: string,
    userId: string,
    bookingId: string,
    code: string,
    subtotal: number,
  ) {
    const validation = await this.validateCoupon(tenantId, { code, subtotal });

    await this.loyaltyRepo.updateCoupon(validation.couponId, {
      usedCount: {
        increment: 1,
      },
    });

    const usage = await this.loyaltyRepo.createCouponUsage({
      couponId: validation.couponId,
      userId,
      bookingId,
      discountGot: validation.discountAmount,
    });

    return {
      ...validation,
      usage,
    };
  }
}
