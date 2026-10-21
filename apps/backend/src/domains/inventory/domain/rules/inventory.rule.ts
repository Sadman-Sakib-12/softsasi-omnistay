/**
 * Pure Domain Rules for Multi-Warehouse Supply Chain & Inventory
 * Zero external framework or database dependencies.
 */

export function generateEan13Barcode(sku: string): string {
  // Generate valid 13-digit EAN-13 style barcode string from alphanumeric SKU
  const cleanNum = sku.replace(/\D/g, '').padEnd(12, '7').slice(0, 12);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanNum[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return `${cleanNum}${checkDigit}`;
}

export function calculateInventoryValuation(
  items: Array<{ productId: string; name: string; sku: string; stockQty: number; unitCost: number }>,
  method: 'FIFO' | 'WAC' = 'FIFO',
) {
  let totalAssetValue = 0;
  const valuationItems = items.map((item) => {
    const qty = Number(item.stockQty);
    const cost = Number(item.unitCost);
    const lineValuation = Math.round(qty * cost * 100) / 100;
    totalAssetValue += lineValuation;

    return {
      productId: item.productId,
      name: item.name,
      sku: item.sku,
      stockQty: qty,
      unitCost: cost,
      lineValuation,
      valuationMethod: method,
    };
  });

  return {
    valuationMethod: method,
    totalItemCount: valuationItems.length,
    totalInventoryAssetValue: Math.round(totalAssetValue * 100) / 100,
    items: valuationItems,
  };
}

export function evaluateThreeWayMatch(
  poTotalCost: number,
  billedAmount: number,
  grnItemsWithCost: Array<{ qtyReceived: number; unitCost: number; isDamaged?: boolean }>,
  tolerancePercent = 1.0,
) {
  let grnValue = 0;
  for (const item of grnItemsWithCost) {
    if (!item.isDamaged) {
      grnValue += Number(item.qtyReceived) * Number(item.unitCost);
    }
  }

  const grnReceivedValue = Math.round(grnValue * 100) / 100;
  const variance = Math.round(Math.abs(billedAmount - grnReceivedValue) * 100) / 100;
  const variancePercent =
    grnReceivedValue > 0 ? Math.round(((variance / grnReceivedValue) * 100) * 100) / 100 : 0;
  const isMatched = variancePercent <= tolerancePercent;

  return {
    matchStatus: isMatched ? ('MATCHED' as const) : ('DISCREPANCY_FLAGGED' as const),
    poAmount: poTotalCost,
    grnReceivedValue,
    billedAmount,
    variance,
    variancePercent,
    recommendation: isMatched
      ? 'Approve vendor payment release'
      : 'Hold payment and issue Debit Note for discrepancy / damaged items',
  };
}
