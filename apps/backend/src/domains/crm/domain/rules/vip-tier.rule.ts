/**
 * Pure Domain Rule: VIP Loyalty Tier Calculation
 * Determines guest tier according to lifetime stay nights and total spend.
 * Zero external framework or database dependencies.
 */
export function determineVipTier(totalNights: number, lifetimeSpend: number): string {
  if (lifetimeSpend >= 25000 || totalNights >= 50) return 'VIP Black';
  if (lifetimeSpend >= 10000 || totalNights >= 30) return 'Platinum';
  if (lifetimeSpend >= 5000 || totalNights >= 15) return 'Gold';
  return 'Silver';
}
