/**
 * Pure Domain Rules for Human Resource Management (HRM) & Payroll
 * Zero external framework or database dependencies.
 */

/**
 * Computes geographic distance in meters between two GPS coordinates using the Haversine formula.
 */
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function isWithinGeofence(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters = 50.0,
): { isWithin: boolean; distanceMeters: number } {
  const distanceMeters = Math.round(calculateDistanceMeters(userLat, userLng, targetLat, targetLng) * 10) / 10;
  return {
    isWithin: distanceMeters <= radiusMeters,
    distanceMeters,
  };
}

export function calculateWorkedHoursAndOvertime(
  clockIn: Date,
  clockOut: Date,
  standardShiftHours = 8,
): { totalWorkedHours: number; overtimeHours: number } {
  const diffMs = clockOut.getTime() - clockIn.getTime();
  const totalWorkedHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  const overtimeHours = totalWorkedHours > standardShiftHours
    ? Math.round((totalWorkedHours - standardShiftHours) * 100) / 100
    : 0;

  return {
    totalWorkedHours,
    overtimeHours,
  };
}

export function calculatePayrollSalary(
  basicSalary: number,
  otHours = 0,
  hourlyRate = basicSalary / 160,
  allowances = 0,
  loanDeduction = 0,
  taxRate = 0.1,
) {
  const otAmount = Math.round(otHours * hourlyRate * 1.5 * 100) / 100;
  const taxDeduction = Math.round(basicSalary * taxRate * 100) / 100;
  const totalEarnings = Math.round((basicSalary + otAmount + allowances) * 100) / 100;
  const totalDeductions = Math.round((taxDeduction + loanDeduction) * 100) / 100;
  const netSalary = Math.max(0, Math.round((totalEarnings - totalDeductions) * 100) / 100);

  return {
    basicSalary,
    hourlyRate: Math.round(hourlyRate * 100) / 100,
    otHours,
    otAmount,
    allowances,
    taxDeduction,
    loanDeduction,
    totalEarnings,
    totalDeductions,
    netSalary,
  };
}

/**
 * Validates whether requested dates clash with peak holiday blackout window (Dec 24 - Jan 2).
 */
export function checkPeakHolidayBlackout(
  startDateStr: string,
  endDateStr: string,
  isEmergency = false,
): boolean {
  if (isEmergency) return false;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const startMonth = start.getUTCMonth();
  const startDay = start.getUTCDate();
  const endMonth = end.getUTCMonth();
  const endDay = end.getUTCDate();

  const isChristmasWindow =
    (startMonth === 11 && startDay >= 24) || (endMonth === 0 && endDay <= 2);

  return isChristmasWindow;
}
