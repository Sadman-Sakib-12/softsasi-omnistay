import { describe, it, expect } from 'vitest';
import {
  validateDoubleEntryJournal,
  calculateInvoiceTotals,
  calculateInvoiceBalance,
  generateAccountingReference,
} from './domain/rules/accounting.rule.js';

describe('Accounting Domain Rules (DDD)', () => {
  describe('validateDoubleEntryJournal', () => {
    it('fails when less than 2 items are provided', () => {
      const res = validateDoubleEntryJournal([{ debit: 100, credit: 0 }]);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('requires at least two line items');
    });

    it('fails when a single line has both debit and credit > 0', () => {
      const res = validateDoubleEntryJournal([
        { debit: 100, credit: 50 },
        { debit: 0, credit: 50 },
      ]);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('cannot have both Debit and Credit amounts');
    });

    it('fails when total debits do not match total credits', () => {
      const res = validateDoubleEntryJournal([
        { debit: 100, credit: 0 },
        { debit: 0, credit: 95 },
      ]);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Double-entry imbalance');
      expect(res.totalDebit).toBe(100);
      expect(res.totalCredit).toBe(95);
    });

    it('succeeds when journal entries are mathematically balanced', () => {
      const res = validateDoubleEntryJournal([
        { debit: 250.5, credit: 0 },
        { debit: 150.25, credit: 0 },
        { debit: 0, credit: 400.75 },
      ]);
      expect(res.isValid).toBe(true);
      expect(res.totalDebit).toBe(400.75);
      expect(res.totalCredit).toBe(400.75);
      expect(res.error).toBeUndefined();
    });
  });

  describe('calculateInvoiceTotals', () => {
    it('returns 0 for empty items array', () => {
      const res = calculateInvoiceTotals([]);
      expect(res.subtotal).toBe(0);
      expect(res.grandTotal).toBe(0);
    });

    it('computes subtotal, taxTotal, and applies discount to grandTotal', () => {
      const items = [
        { quantity: 2, unitPrice: 100, taxAmount: 10 },
        { quantity: 1, unitPrice: 50, taxAmount: 5 },
      ];
      const res = calculateInvoiceTotals(items, 20); // 20 discount
      expect(res.subtotal).toBe(250);
      expect(res.taxTotal).toBe(15);
      expect(res.discountTotal).toBe(20);
      // Grand total = 250 + 15 - 20 = 245
      expect(res.grandTotal).toBe(245);
    });
  });

  describe('calculateInvoiceBalance', () => {
    it('marks invoice as paid when balance is zero', () => {
      const res = calculateInvoiceBalance(500, 500, 0);
      expect(res.balanceDue).toBe(0);
      expect(res.status).toBe('paid');
    });

    it('marks invoice as partially_paid when partial payment exists', () => {
      const res = calculateInvoiceBalance(500, 200, 50);
      expect(res.balanceDue).toBe(250);
      expect(res.status).toBe('partially_paid');
    });

    it('marks invoice as sent when zero payments recorded', () => {
      const res = calculateInvoiceBalance(500, 0, 0);
      expect(res.balanceDue).toBe(500);
      expect(res.status).toBe('sent');
    });
  });

  describe('generateAccountingReference', () => {
    it('generates JE reference with current year', () => {
      const ref = generateAccountingReference('JE', new Date('2026-05-10'));
      expect(ref).toMatch(/^JE-2026-[A-F0-9]{8}$/);
    });

    it('generates INV reference with current year', () => {
      const ref = generateAccountingReference('INV', new Date('2026-05-10'));
      expect(ref).toMatch(/^INV-2026-[A-F0-9]{8}$/);
    });
  });
});
