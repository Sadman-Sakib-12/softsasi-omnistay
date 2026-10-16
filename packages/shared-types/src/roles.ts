/**
 * Softsasi OmniStay 360 - 10 Platform Roles & Personas
 * Source of truth: Sakib_Project_Plan.pdf (Chapter 1 §1.4 & Chapter 19 §19.4)
 */

export const PlatformRoles = {
  SUPERADMIN: 'SuperAdmin',
  COMPANY_OWNER_GM: 'Company Owner/GM',
  FINANCIAL_ACCOUNTANT: 'Financial Accountant',
  FRONT_DESK_AGENT: 'Front Desk Agent',
  HOUSEKEEPING_SUPERVISOR: 'Housekeeping Supervisor',
  POS_WAITER_CASHIER: 'POS Waiter / Cashier',
  HR_DIRECTOR: 'HR Director',
  THIRD_PARTY_VENDOR: 'Third-Party Vendor',
  GUEST_TRAVELER: 'Guest / Traveler',
  MAINTENANCE_ENGINEER: 'Maintenance Engineer',
} as const;

export type PlatformRole = (typeof PlatformRoles)[keyof typeof PlatformRoles];

/**
 * Roles that mandate Two-Factor Authentication (2FA) prior to session activation.
 * Source of truth: Sakib_Project_Plan.pdf (Chapter 19 §19.5)
 */
export const MANDATORY_2FA_ROLES: readonly PlatformRole[] = [
  PlatformRoles.SUPERADMIN,
  PlatformRoles.COMPANY_OWNER_GM,
  PlatformRoles.FINANCIAL_ACCOUNTANT,
] as const;
