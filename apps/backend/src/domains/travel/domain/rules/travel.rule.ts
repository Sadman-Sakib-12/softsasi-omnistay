import { randomBytes, createHmac } from 'crypto';

export interface CartItemInput {
  vertical: string;
  unitPrice: number;
  quantity: number;
  title?: string;
}

export interface CartCalculationResult {
  itemCount: number;
  distinctVerticalCount: number;
  bundledVerticals: string[];
  subtotal: number;
  bundleDiscountPercent: number;
  bundleDiscountAmount: number;
  taxAmount: number;
  grandTotal: number;
}

/**
 * Computes subtotal, dynamic vacation bundle discounts, taxes, and grand total.
 * - 2 distinct verticals (e.g., hotel + car) = 10% bundle discount
 * - 3+ distinct verticals (e.g., hotel + car + tour) = 15% bundle discount
 * - 5% standard hospitality tax on taxable balance
 */
export function calculateCartTotals(items: CartItemInput[]): CartCalculationResult {
  if (!items || items.length === 0) {
    return {
      itemCount: 0,
      distinctVerticalCount: 0,
      bundledVerticals: [],
      subtotal: 0,
      bundleDiscountPercent: 0,
      bundleDiscountAmount: 0,
      taxAmount: 0,
      grandTotal: 0,
    };
  }

  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.unitPrice) * (item.quantity || 1),
    0,
  );

  const uniqueVerticals = Array.from(new Set(items.map((i) => i.vertical)));
  let bundleDiscountPercent = 0;

  if (uniqueVerticals.length >= 3) {
    bundleDiscountPercent = 15;
  } else if (uniqueVerticals.length === 2) {
    bundleDiscountPercent = 10;
  }

  const bundleDiscountAmount = Math.round((subtotal * (bundleDiscountPercent / 100)) * 100) / 100;
  const taxableAmount = Math.max(0, subtotal - bundleDiscountAmount);
  const standardTaxRate = 0.05;
  const taxAmount = Math.round((taxableAmount * standardTaxRate) * 100) / 100;
  const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

  return {
    itemCount: items.length,
    distinctVerticalCount: uniqueVerticals.length,
    bundledVerticals: uniqueVerticals,
    subtotal: Math.round(subtotal * 100) / 100,
    bundleDiscountPercent,
    bundleDiscountAmount,
    taxAmount,
    grandTotal,
  };
}

/**
 * Calculates rental duration and total charges for vehicles (cars, boats).
 */
export function calculateRentalDurationAndTotal(
  pickupDate: Date,
  dropoffDate: Date,
  dailyRate: number,
): { days: number; totalAmount: number } {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  if (isNaN(pickup.getTime()) || isNaN(dropoff.getTime()) || dropoff <= pickup) {
    throw new Error('Drop-off date must be strictly after pickup date');
  }

  const days = Math.max(1, Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
  const totalAmount = Math.round(days * dailyRate * 100) / 100;

  return { days, totalAmount };
}

/**
 * Generates an HMAC-signed vacation travel voucher code.
 */
export function generateVoucherCode(secret = 'omnistay-vacation-voucher-secret'): string {
  const voucherRaw = `VCH-${randomBytes(4).toString('hex').toUpperCase()}`;
  const voucherSig = createHmac('sha256', secret)
    .update(voucherRaw)
    .digest('hex')
    .substring(0, 6)
    .toUpperCase();
  return `${voucherRaw}-${voucherSig}`;
}

/**
 * Generates a standard travel reservation reference.
 */
export function generateBookingReference(prefix = 'BK-VAC'): string {
  return `${prefix}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

/**
 * Generates a flight boarding ticket code.
 */
export function generateFlightTicketCode(flightNumber: string): string {
  return `BRD-${flightNumber}-${randomBytes(3).toString('hex').toUpperCase()}`;
}
