/**
 * Pure Domain Rule: Commission & Review Calculations
 * Zero external framework or database dependencies.
 */

export function calculateCommissionRate(
  baseRate: number,
  vertical?: string,
  monthlyGmv?: number,
): number {
  // 1. High volume tier check
  if (monthlyGmv && monthlyGmv >= 100000) {
    return 10.0;
  }
  if (monthlyGmv && monthlyGmv >= 50000) {
    return 12.0;
  }

  // 2. Vertical-specific rate overrides
  if (vertical) {
    switch (vertical.toLowerCase()) {
      case 'tour':
      case 'tours':
        return 20.0;
      case 'boat':
      case 'boats':
      case 'yacht':
        return 18.0;
      case 'hotel':
      case 'hospitality':
        return 15.0;
      case 'car':
      case 'cars':
        return 12.0;
      case 'space':
      case 'spaces':
        return 10.0;
      case 'flight':
      case 'flights':
        return 5.0;
    }
  }

  return baseRate;
}

export function calculateReviewAverage(ratings: Array<{ score: number }>): number {
  if (!ratings.length) return 5.0;
  const sum = ratings.reduce((acc, r) => acc + r.score, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}
