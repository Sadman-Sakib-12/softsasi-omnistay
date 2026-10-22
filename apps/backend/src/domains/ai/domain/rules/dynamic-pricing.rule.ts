/**
 * Pure Domain Rules for AI Dynamic Yield & Revenue Management
 * Zero external framework or database dependencies.
 */

export interface DynamicPricingEvaluationResult {
  originalRate: number;
  suggestedRate: number;
  appliedRate: number;
  surgeMultiplier: number;
  adjustmentReason: string;
  isLastMinuteDiscount: boolean;
}

export function calculateSurgePricing(
  baseRate: number,
  currentOccupancyPct: number,
  daysUntilArrival: number,
  competitorAvgRate?: number,
): DynamicPricingEvaluationResult {
  let rate = baseRate;
  let multiplier = 1.0;
  let reason = 'Standard base rate';
  let isLastMinute = false;

  // 1. Tactical Last-Minute Discount (48 hours prior to arrival with low occupancy)
  if (daysUntilArrival <= 2 && currentOccupancyPct < 60) {
    multiplier = 0.85; // 15% discount
    rate = Math.round(baseRate * multiplier * 100) / 100;
    reason = 'Tactical last-minute yield promotion (<48h arrival & <60% occupancy)';
    isLastMinute = true;
  }
  // 2. High-Demand Elasticity Surge Tiers
  else if (currentOccupancyPct >= 90) {
    multiplier = 1.25; // 25% surge
    rate = Math.round(baseRate * multiplier * 100) / 100;
    reason = 'Ultra-high demand surge (>=90% occupancy)';
  } else if (currentOccupancyPct >= 80) {
    multiplier = 1.15; // 15% surge
    rate = Math.round(baseRate * multiplier * 100) / 100;
    reason = 'Strong demand pacing surge (>=80% occupancy)';
  } else if (currentOccupancyPct >= 70) {
    multiplier = 1.05; // 5% surge
    rate = Math.round(baseRate * multiplier * 100) / 100;
    reason = 'Moderate demand optimization (>=70% occupancy)';
  }

  // 3. Automated Competitor Rate Calibration (5-mile radius benchmark)
  if (competitorAvgRate && competitorAvgRate > 0) {
    const competitorCeiling = competitorAvgRate * 1.1; // Maximum 10% premium above competitor avg
    if (rate > competitorCeiling && currentOccupancyPct < 85) {
      rate = Math.round(competitorCeiling * 100) / 100;
      multiplier = Math.round((rate / baseRate) * 100) / 100;
      reason += ' | Calibrated to competitor benchmark ceiling';
    }
  }

  return {
    originalRate: baseRate,
    suggestedRate: rate,
    appliedRate: rate,
    surgeMultiplier: multiplier,
    adjustmentReason: reason,
    isLastMinuteDiscount: isLastMinute,
  };
}

export function calculatePickupVelocity(
  initialOccupancy: number,
  currentOccupancy: number,
  daysElapsed: number,
): number {
  if (daysElapsed <= 0) return 0;
  return Math.round(((currentOccupancy - initialOccupancy) / daysElapsed) * 100) / 100;
}

export function calculate90DayForecast(
  totalRooms: number,
  historicalOccupancyRate: number,
  confirmedBookingsCount: number,
  averageDailyRate: number,
  daysInWindow: number = 90,
): {
  projectedOccupancy: number;
  projectedRevenue: number;
  projectedRevPAR: number;
} {
  const confirmedOccupancyRate = totalRooms > 0
    ? (confirmedBookingsCount / (totalRooms * daysInWindow)) * 100
    : 0;

  // Weighted blend: 60% confirmed pacing + 40% historical baseline
  const projectedOccupancy = Math.min(
    100,
    Math.round((confirmedOccupancyRate * 0.6 + historicalOccupancyRate * 0.4) * 100) / 100,
  );

  const totalRoomNights = totalRooms * daysInWindow;
  const projectedSoldNights = (projectedOccupancy / 100) * totalRoomNights;
  const projectedRevenue = Math.round(projectedSoldNights * averageDailyRate * 100) / 100;
  const projectedRevPAR = Math.round((projectedRevenue / totalRoomNights) * 100) / 100;

  return {
    projectedOccupancy,
    projectedRevenue,
    projectedRevPAR,
  };
}

export function detectExpenseAnomaly(
  historicalAverageExpense: number,
  currentExpense: number,
  thresholdMultiplier: number = 1.5,
): { isAnomaly: boolean; deviationPct: number; details: string } {
  if (historicalAverageExpense <= 0) {
    return { isAnomaly: false, deviationPct: 0, details: 'Insufficient historical baseline.' };
  }

  const deviationPct = Math.round(
    ((currentExpense - historicalAverageExpense) / historicalAverageExpense) * 100,
  );

  const isAnomaly = currentExpense > historicalAverageExpense * thresholdMultiplier;
  const details = isAnomaly
    ? `Expense exceeds historical baseline by ${deviationPct}% (Threshold: ${thresholdMultiplier}x).`
    : 'Expenditure is within expected normal variance.';

  return { isAnomaly, deviationPct, details };
}
