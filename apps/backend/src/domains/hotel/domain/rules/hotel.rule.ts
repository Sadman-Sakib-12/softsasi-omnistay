import crypto from 'node:crypto';

/**
 * Pure Domain Rules for Hotel PMS & Bookings Engine
 * Zero external framework or database dependencies.
 */

export function generateBookingCode(): string {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `BK-${randomHex}${timestamp}`;
}

export function calculateBookingNightsAndTotals(
  checkIn: Date,
  checkOut: Date,
  basePrice: number,
  depositAmount = 0,
) {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalAmount = Math.round(basePrice * nights * 100) / 100;
  const deposit = depositAmount ? Math.min(depositAmount, totalAmount) : 0;
  const balanceDue = Math.max(0, Math.round((totalAmount - deposit) * 100) / 100);

  return {
    nights,
    totalAmount,
    depositAmount: deposit,
    balanceDue,
  };
}

export function calculateFolioBalance(
  charges: Array<{ amount: number }>,
  payments: Array<{ amount: number }>,
) {
  const totalCharges = charges.reduce((acc, c) => acc + Number(c.amount || 0), 0);
  const totalPayments = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const balanceDue = Math.max(0, Math.round((totalCharges - totalPayments) * 100) / 100);

  return {
    totalCharges: Math.round(totalCharges * 100) / 100,
    totalPayments: Math.round(totalPayments * 100) / 100,
    balanceDue,
    isSettled: balanceDue === 0 && totalCharges > 0,
  };
}

export function calculateMaintenanceSla(priority: 'low' | 'medium' | 'high' | 'emergency'): number {
  switch (priority) {
    case 'emergency':
      return 2; // 2 hours SLA
    case 'high':
      return 6; // 6 hours SLA
    case 'medium':
      return 24; // 24 hours SLA
    case 'low':
    default:
      return 48; // 48 hours SLA
  }
}
