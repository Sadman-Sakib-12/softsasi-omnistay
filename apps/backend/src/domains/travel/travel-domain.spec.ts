import { describe, it, expect } from 'vitest';
import {
  calculateCartTotals,
  calculateRentalDurationAndTotal,
  generateVoucherCode,
  generateBookingReference,
  generateFlightTicketCode,
} from './domain/rules/travel.rule.js';

describe('Travel Domain Rules (DDD)', () => {
  describe('calculateCartTotals', () => {
    it('returns zeroes for empty cart', () => {
      const result = calculateCartTotals([]);
      expect(result.subtotal).toBe(0);
      expect(result.grandTotal).toBe(0);
      expect(result.bundleDiscountPercent).toBe(0);
      expect(result.itemCount).toBe(0);
    });

    it('calculates totals with 0% discount for a single vertical', () => {
      const result = calculateCartTotals([
        { vertical: 'car', unitPrice: 100, quantity: 2 },
      ]);
      expect(result.subtotal).toBe(200);
      expect(result.bundleDiscountPercent).toBe(0);
      expect(result.bundleDiscountAmount).toBe(0);
      expect(result.taxAmount).toBe(10); // 5% of 200
      expect(result.grandTotal).toBe(210);
    });

    it('calculates totals with 10% discount for 2 distinct verticals', () => {
      const result = calculateCartTotals([
        { vertical: 'hotel', unitPrice: 200, quantity: 1 },
        { vertical: 'car', unitPrice: 100, quantity: 1 },
      ]);
      expect(result.subtotal).toBe(300);
      expect(result.bundleDiscountPercent).toBe(10);
      expect(result.bundleDiscountAmount).toBe(30);
      // Taxable = 270, 5% of 270 = 13.5
      expect(result.taxAmount).toBe(13.5);
      expect(result.grandTotal).toBe(283.5);
    });

    it('calculates totals with 15% discount for 3+ distinct verticals', () => {
      const result = calculateCartTotals([
        { vertical: 'hotel', unitPrice: 300, quantity: 1 },
        { vertical: 'flight', unitPrice: 400, quantity: 1 },
        { vertical: 'tour', unitPrice: 100, quantity: 1 },
      ]);
      expect(result.subtotal).toBe(800);
      expect(result.bundleDiscountPercent).toBe(15);
      expect(result.bundleDiscountAmount).toBe(120);
      // Taxable = 680, 5% of 680 = 34
      expect(result.taxAmount).toBe(34);
      expect(result.grandTotal).toBe(714);
    });
  });

  describe('calculateRentalDurationAndTotal', () => {
    it('calculates rental duration and price for valid date range', () => {
      const pickup = new Date('2026-11-01T10:00:00Z');
      const dropoff = new Date('2026-11-04T10:00:00Z');
      const result = calculateRentalDurationAndTotal(pickup, dropoff, 75);
      expect(result.days).toBe(3);
      expect(result.totalAmount).toBe(225);
    });

    it('throws error when drop-off date is on or before pickup date', () => {
      const pickup = new Date('2026-11-05T10:00:00Z');
      const dropoff = new Date('2026-11-05T09:00:00Z');
      expect(() => calculateRentalDurationAndTotal(pickup, dropoff, 50)).toThrow(
        'Drop-off date must be strictly after pickup date',
      );
    });
  });

  describe('Code and Identifier Generators', () => {
    it('generates a valid voucher code format', () => {
      const code = generateVoucherCode('secret-key');
      expect(code).toMatch(/^VCH-[A-F0-9]{8}-[A-F0-9]{6}$/);
    });

    it('generates a booking reference with correct prefix', () => {
      const ref = generateBookingReference('BK-VAC');
      expect(ref).toMatch(/^BK-VAC-[A-F0-9]{6}$/);
    });

    it('generates a flight boarding ticket code', () => {
      const code = generateFlightTicketCode('EK202');
      expect(code).toMatch(/^BRD-EK202-[A-F0-9]{6}$/);
    });
  });
});
