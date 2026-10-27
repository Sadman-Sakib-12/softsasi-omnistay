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

/**
 * Standard Multi-Tenant Role Enum used across Admin and Backend Services
 */
export enum Role {
  PLATFORM_SUPERADMIN = 'PLATFORM_SUPERADMIN',
  COMPANY_OWNER_GM = 'COMPANY_OWNER_GM',
  CFO_ACCOUNTANT = 'CFO_ACCOUNTANT',
  FRONT_DESK_AGENT = 'FRONT_DESK_AGENT',
  HOUSEKEEPING_SUPERVISOR = 'HOUSEKEEPING_SUPERVISOR',
  POS_CASHIER = 'POS_CASHIER',
  HR_DIRECTOR = 'HR_DIRECTOR',
  VENDOR_HOST = 'VENDOR_HOST',
  MAINTENANCE_ENGINEER = 'MAINTENANCE_ENGINEER',
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.PLATFORM_SUPERADMIN]: 'Platform SuperAdmin',
  [Role.COMPANY_OWNER_GM]: 'Company Owner / General Manager',
  [Role.CFO_ACCOUNTANT]: 'CFO / Accountant',
  [Role.FRONT_DESK_AGENT]: 'Front Desk Agent',
  [Role.HOUSEKEEPING_SUPERVISOR]: 'Housekeeping Supervisor',
  [Role.POS_CASHIER]: 'F&B / POS Cashier',
  [Role.HR_DIRECTOR]: 'HR & Payroll Director',
  [Role.VENDOR_HOST]: 'Third-Party Vendor / Host',
  [Role.MAINTENANCE_ENGINEER]: 'Maintenance Engineer',
};

export const ROLE_ROUTE_PERMISSIONS: Record<Role, string[]> = {
  [Role.PLATFORM_SUPERADMIN]: [
    '/dashboard',
    '/properties',
    '/rooms',
    '/reservations',
    '/front-desk',
    '/housekeeping',
    '/finance',
    '/marketplace',
    '/inventory',
    '/hrm',
    '/crm',
    '/reports',
    '/audit-logs',
    '/users',
    '/roles',
    '/organizations',
    '/settings',
    '/locations',
    '/tours',
    '/spaces',
    '/flights',
    '/cars',
    '/boats',
    '/events',
    '/coupons',
    '/reviews',
    '/news',
    '/pages',
    '/media',
    '/pos',
    '/ai',
    '/iot',
    '/projects',
    '/messages',
    '/wallet',
    '/popup',
    '/menu',
  ],
  [Role.COMPANY_OWNER_GM]: [
    '/dashboard',
    '/organizations',
    '/properties',
    '/rooms',
    '/reservations',
    '/front-desk',
    '/housekeeping',
    '/finance',
    '/marketplace',
    '/inventory',
    '/hrm',
    '/crm',
    '/reports',
    '/audit-logs',
    '/users',
    '/roles',
    '/settings',
    '/locations',
    '/tours',
    '/spaces',
    '/flights',
    '/cars',
    '/boats',
    '/events',
    '/coupons',
    '/reviews',
    '/news',
    '/pages',
    '/media',
    '/pos',
    '/ai',
    '/iot',
    '/projects',
    '/messages',
    '/wallet',
    '/popup',
    '/menu',
  ],
  [Role.CFO_ACCOUNTANT]: [
    '/dashboard',
    '/finance',
    '/reports',
    '/reservations',
    '/audit-logs',
  ],
  [Role.FRONT_DESK_AGENT]: [
    '/dashboard',
    '/properties',
    '/rooms',
    '/reservations',
    '/front-desk',
    '/messages',
  ],
  [Role.HOUSEKEEPING_SUPERVISOR]: [
    '/dashboard',
    '/housekeeping',
    '/rooms',
    '/inventory',
  ],
  [Role.POS_CASHIER]: [
    '/dashboard',
    '/pos',
    '/front-desk',
    '/finance',
  ],
  [Role.HR_DIRECTOR]: [
    '/dashboard',
    '/hrm',
    '/users',
    '/reports',
  ],
  [Role.VENDOR_HOST]: [
    '/dashboard',
    '/properties',
    '/marketplace',
    '/reports',
  ],
  [Role.MAINTENANCE_ENGINEER]: [
    '/dashboard',
    '/housekeeping',
    '/inventory',
    '/rooms',
  ],
};

export function normalizeRole(role?: string): Role {
  if (!role) return Role.PLATFORM_SUPERADMIN;
  const upper = role.toUpperCase().replace(/[^A-Z]/g, '_');
  if (upper.includes('SUPERADMIN') || upper.includes('SUPER_ADMIN')) return Role.PLATFORM_SUPERADMIN;
  if (upper.includes('OWNER') || upper.includes('GENERAL_MANAGER') || upper.includes('GM')) return Role.COMPANY_OWNER_GM;
  if (upper.includes('CFO') || upper.includes('ACCOUNTANT') || upper.includes('FINANCIAL')) return Role.CFO_ACCOUNTANT;
  if (upper.includes('FRONT_DESK')) return Role.FRONT_DESK_AGENT;
  if (upper.includes('HOUSEKEEPING')) return Role.HOUSEKEEPING_SUPERVISOR;
  if (upper.includes('POS') || upper.includes('CASHIER') || upper.includes('WAITER')) return Role.POS_CASHIER;
  if (upper.includes('HR')) return Role.HR_DIRECTOR;
  if (upper.includes('VENDOR') || upper.includes('HOST')) return Role.VENDOR_HOST;
  if (upper.includes('MAINTENANCE')) return Role.MAINTENANCE_ENGINEER;
  return (role as Role) || Role.COMPANY_OWNER_GM;
}

export function isRouteAllowedForRole(role: string, path: string): boolean {
  const normalized = normalizeRole(role);
  const allowed = ROLE_ROUTE_PERMISSIONS[normalized];
  if (!allowed) return true;
  return allowed.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
