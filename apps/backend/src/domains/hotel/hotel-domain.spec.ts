import { describe, it, expect } from 'vitest';
import {
  calculateBookingNightsAndTotals,
  calculateFolioBalance,
  calculateMaintenanceSla,
  generateBookingCode,
} from './domain/rules/hotel.rule.js';

describe('Hotel Domain — Clean Architecture & DDD Test Suite', () => {
  describe('Domain Rules (Pure Business Logic)', () => {
    it('generateBookingCode: should generate unique alphanumeric booking code starting with BK-', () => {
      const code1 = generateBookingCode();
      const code2 = generateBookingCode();
      expect(code1).toMatch(/^BK-[0-9A-F]{6}\d{4}$/);
      expect(code2).toMatch(/^BK-[0-9A-F]{6}\d{4}$/);
      expect(code1).not.toBe(code2);
    });

    it('calculateBookingNightsAndTotals: should accurately calculate nights and totals', () => {
      const checkIn = new Date('2026-11-01T15:00:00Z');
      const checkOut = new Date('2026-11-04T11:00:00Z'); // 3 nights
      const basePrice = 150.0;
      const deposit = 100.0;

      const result = calculateBookingNightsAndTotals(checkIn, checkOut, basePrice, deposit);
      expect(result.nights).toBe(3);
      expect(result.totalAmount).toBe(450.0);
      expect(result.depositAmount).toBe(100.0);
      expect(result.balanceDue).toBe(350.0);
    });

    it('calculateFolioBalance: should aggregate charges and payments and determine settlement', () => {
      const charges = [{ amount: 450.0 }, { amount: 55.0 }, { amount: 20.0 }]; // 525
      const payments = [{ amount: 200.0 }, { amount: 325.0 }]; // 525
      const folio = calculateFolioBalance(charges, payments);
      expect(folio.totalCharges).toBe(525.0);
      expect(folio.totalPayments).toBe(525.0);
      expect(folio.balanceDue).toBe(0);
      expect(folio.isSettled).toBe(true);

      const partialPayments = [{ amount: 200.0 }];
      const partialFolio = calculateFolioBalance(charges, partialPayments);
      expect(partialFolio.balanceDue).toBe(325.0);
      expect(partialFolio.isSettled).toBe(false);
    });

    it('calculateMaintenanceSla: should assign correct SLA hours based on priority', () => {
      expect(calculateMaintenanceSla('emergency')).toBe(2);
      expect(calculateMaintenanceSla('high')).toBe(6);
      expect(calculateMaintenanceSla('medium')).toBe(24);
      expect(calculateMaintenanceSla('low')).toBe(48);
    });
  });
});
