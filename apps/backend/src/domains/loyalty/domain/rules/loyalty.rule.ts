import { randomBytes } from 'crypto';

/**
 * Pure Domain Rules for Loyalty, Points, Gift Cards & Discounts
 * Zero external framework or database dependencies.
 */

export function calculatePointsEarned(amountSpent: number, multiplier: number): number {
  return Math.round(amountSpent * (multiplier || 1.0));
}

export function calculatePointsDiscount(pointsToRedeem: number): number {
  // 100 points = $1.00 discount
  return Math.round((pointsToRedeem / 100) * 100) / 100;
}

export function generateGiftCardCode(): string {
  const raw = randomBytes(6).toString('hex').toUpperCase();
  return `GFT-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

export function evaluateCouponDiscount(
  subtotal: number,
  discountType: string,
  discountValue: number,
): number {
  if (discountType === 'percentage') {
    return Math.round(((subtotal * discountValue) / 100) * 100) / 100;
  }
  return Math.min(discountValue, subtotal);
}
