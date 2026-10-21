import { randomBytes } from 'crypto';

export interface JournalItemValidationInput {
  accountId?: string;
  debit?: number;
  credit?: number;
}

export interface JournalValidationResult {
  isValid: boolean;
  totalDebit: number;
  totalCredit: number;
  error?: string;
}

/**
 * Validates double-entry general ledger journal balance rules:
 * - Minimum of 2 entries (debit & credit)
 * - Single item cannot contain both debit > 0 and credit > 0
 * - Total debits must precisely equal total credits (within 2 decimal points)
 */
export function validateDoubleEntryJournal(
  items: JournalItemValidationInput[],
): JournalValidationResult {
  if (!items || items.length < 2) {
    return {
      isValid: false,
      totalDebit: 0,
      totalCredit: 0,
      error: 'A double-entry journal requires at least two line items (Debit and Credit)',
    };
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const item of items) {
    const d = Number(item.debit || 0);
    const c = Number(item.credit || 0);

    if (d > 0 && c > 0) {
      return {
        isValid: false,
        totalDebit,
        totalCredit,
        error: 'A single journal line cannot have both Debit and Credit amounts',
      };
    }

    totalDebit += d;
    totalCredit += c;
  }

  totalDebit = Math.round(totalDebit * 100) / 100;
  totalCredit = Math.round(totalCredit * 100) / 100;

  if (totalDebit !== totalCredit) {
    return {
      isValid: false,
      totalDebit,
      totalCredit,
      error: `Double-entry imbalance: Total Debits ($${totalDebit}) must precisely equal Total Credits ($${totalCredit})`,
    };
  }

  return {
    isValid: true,
    totalDebit,
    totalCredit,
  };
}

export interface InvoiceItemCalculationInput {
  quantity: number;
  unitPrice: number;
  taxAmount?: number;
}

export interface InvoiceCalculationResult {
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
}

/**
 * Calculates subtotal, taxes, discounts, and grand total for invoices and billing.
 */
export function calculateInvoiceTotals(
  items: InvoiceItemCalculationInput[],
  discountTotal = 0,
): InvoiceCalculationResult {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      taxTotal: 0,
      discountTotal: 0,
      grandTotal: 0,
    };
  }

  let subtotal = 0;
  let taxTotal = 0;

  for (const item of items) {
    subtotal += Number(item.unitPrice) * item.quantity;
    taxTotal += Number(item.taxAmount || 0);
  }

  subtotal = Math.round(subtotal * 100) / 100;
  taxTotal = Math.round(taxTotal * 100) / 100;
  const discount = Math.round(Number(discountTotal || 0) * 100) / 100;
  const grandTotal = Math.max(0, Math.round((subtotal + taxTotal - discount) * 100) / 100);

  return {
    subtotal,
    taxTotal,
    discountTotal: discount,
    grandTotal,
  };
}

/**
 * Calculates remaining balance and lifecycle status for invoices/bills.
 */
export function calculateInvoiceBalance(
  grandTotal: number,
  totalPayments: number,
  totalCredits = 0,
): { balanceDue: number; status: 'paid' | 'partially_paid' | 'sent' } {
  const balanceDue = Math.max(
    0,
    Math.round((grandTotal - totalPayments - totalCredits) * 100) / 100,
  );

  let status: 'paid' | 'partially_paid' | 'sent' = 'sent';
  if (balanceDue <= 0) {
    status = 'paid';
  } else if (totalPayments > 0) {
    status = 'partially_paid';
  }

  return { balanceDue, status };
}

/**
 * Formats standard double-entry accounting reference codes.
 */
export function generateAccountingReference(
  prefix: 'JE' | 'INV' | 'BILL' | 'PAY' = 'JE',
  date = new Date(),
): string {
  const year = new Date(date).getFullYear();
  const hex = randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${year}-${hex}`;
}
