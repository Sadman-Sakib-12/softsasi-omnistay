/**
 * Pure Domain Rules for Point of Sale (POS)
 * Zero external framework or database dependencies.
 */

export function calculateOrderTotals(
  items: Array<{ quantity: number; unitPrice: number }>,
  taxRatePercent = 10,
  serviceChargePercent = 5,
) {
  const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
  const taxAmount = Math.round(((subtotal * taxRatePercent) / 100) * 100) / 100;
  const serviceCharge = Math.round(((subtotal * serviceChargePercent) / 100) * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount + serviceCharge) * 100) / 100;

  return {
    subtotal,
    taxAmount,
    serviceCharge,
    totalAmount,
  };
}

export function calculateShiftVariance(actualCash: number, expectedCash: number) {
  const variance = Math.round((actualCash - expectedCash) * 100) / 100;
  let status: 'balanced' | 'overage' | 'shortage' = 'balanced';
  if (variance > 0) status = 'overage';
  else if (variance < 0) status = 'shortage';

  return {
    variance,
    status,
  };
}
