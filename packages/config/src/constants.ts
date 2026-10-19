/**
 * Master Enterprise Constants for Softsasi OmniStay 360
 * Aligned strictly with Sakib_Project_Plan.pdf specifications.
 */

export const PLATFORM = {
  NAME: 'Softsasi OmniStay 360 Enterprise Suite',
  CODENAME: 'Project Titan',
  VERSION: '1.0.0',
  DEFAULT_TIMEZONE: 'Asia/Dhaka',
  DEFAULT_CURRENCY: 'BDT',
  DEFAULT_LOCALE: 'en',
} as const;

export const SUPPORTED_CURRENCIES = [
  'BDT',
  'USD',
  'EUR',
  'GBP',
  'INR',
  'AED',
  'SAR',
] as const;

export const SUPPORTED_LOCALES = [
  'en',
  'bn',
  'ar',
  'es',
  'fr',
] as const;

export const HOSPITALITY_DEFAULTS = {
  CHECK_IN_TIME: '14:00',
  CHECK_OUT_TIME: '11:00',
  CHECK_IN_GRACE_MINUTES: 60,
  /**
   * 10-minute temporary inventory lock acquired via Redis Redlock (Section 2.4)
   */
  RESERVATION_LOCK_TTL_SECONDS: 600,
  /**
   * Default early check-in and late checkout fee percentages
   */
  LATE_CHECKOUT_AFTER_1400_FEE_PCT: 50,
  LATE_CHECKOUT_AFTER_1800_FEE_PCT: 100,
} as const;

export const SECURITY_DEFAULTS = {
  /**
   * Max allowed login attempts per sliding window (Section 2.1)
   */
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS: 5,
  LOGIN_RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  /**
   * Password reset token validity window
   */
  PASSWORD_RESET_TOKEN_TTL_MINUTES: 15,
  /**
   * 2FA challenge token validity window
   */
  TWO_FACTOR_CHALLENGE_TTL_SECONDS: 300, // 5 minutes
} as const;

/**
 * USALI (Uniform System of Accounts for the Lodging Industry)
 * Account Code Hierarchy Mapping (Chapter 7.1)
 */
export const USALI_ACCOUNT_RANGES = {
  ASSETS: { start: 1000, end: 1999, class: 'Assets' },
  LIABILITIES: { start: 2000, end: 2999, class: 'Liabilities' },
  EQUITY: { start: 3000, end: 3999, class: 'Equity' },
  REVENUE: { start: 4000, end: 4999, class: 'Revenue' },
  COGS: { start: 5000, end: 5999, class: 'Cost of Goods Sold' },
  OPEX: { start: 6000, end: 6999, class: 'Operating Expenses' },
} as const;
