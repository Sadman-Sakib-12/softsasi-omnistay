/**
 * Pure Domain Rule: Lead Scoring Algorithm
 * Calculates an objective lead priority score (0-100) based on budget, guest headcount, and duration.
 * Zero external framework or database dependencies.
 */
export function calculateLeadScore(
  budget?: number,
  guestCount?: number,
  durationDays?: number,
): number {
  let score = 40;
  if (budget) {
    if (budget >= 50000) score += 25;
    else if (budget >= 15000) score += 15;
    else if (budget >= 5000) score += 5;
  }
  if (guestCount) {
    if (guestCount >= 100) score += 20;
    else if (guestCount >= 30) score += 10;
    else if (guestCount >= 10) score += 5;
  }
  if (durationDays) {
    if (durationDays >= 3) score += 15;
    else if (durationDays >= 1) score += 5;
  }
  return Math.min(score, 100);
}
