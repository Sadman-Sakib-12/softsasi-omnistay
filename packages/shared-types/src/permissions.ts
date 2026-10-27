/**
 * Softsasi OmniStay 360 - Granular Capability Flags & Permissions
 * Source of truth: Sakib_Project_Plan.pdf (Chapter 3 §3.2) & existing codebase
 */

export enum Permission {
  // System Administration
  SYSTEM_ROOT = 'system:root',
  TENANT_MANAGE = 'tenant:manage',
  TENANT_AUDIT = 'tenant:audit',
  TENANT_CREATE = 'tenant:create',
  AUDIT_EXPORT = 'audit:export',

  // Hospitality & Properties
  HOTEL_CREATE = 'hotel.create',
  MANAGE_PROPERTIES = 'properties:manage',
  VIEW_PROPERTIES = 'properties:view',
  PROPERTIES_MANAGE = 'properties:manage',
  MANAGE_ROOMS = 'rooms:manage',
  VIEW_ROOMS = 'rooms:view',
  ROOMS_MANAGE = 'rooms:manage',
  ROOMS_READ = 'rooms:read',
  RATES_MANAGE = 'rates:manage',
  MANAGE_RESERVATIONS = 'reservations:manage',
  RESERVATIONS_MANAGE = 'reservations:manage',
  RESERVATIONS_READ = 'reservations:read',
  CHECK_IN_GUEST = 'reservations:check-in',
  CHECK_OUT_GUEST = 'reservations:check-out',

  // Financial & Folio
  FOLIO_SETTLE = 'folio.settle',
  RUN_NIGHT_AUDIT = 'accounting:night-audit',
  VIEW_FINANCIALS = 'accounting:view',
  FINANCE_READ = 'finance:read',
  JOURNAL_POST = 'journal.post',
  REPORTS_VIEW = 'reports:view',

  // POS & F&B
  POS_DISCOUNT = 'pos.discount',

  // HRM & Payroll
  STAFF_MANAGE = 'staff:manage',
  PAYROLL_RUN = 'payroll.run',

  // Admin & IAM Settings
  MANAGE_USERS = 'users:manage',
  MANAGE_SETTINGS = 'settings:manage',
}

export const Permissions = Permission;

export function hasPermission(
  userPermissions: string[] = [],
  requiredPermission: Permission | string
): boolean {
  if (
    userPermissions.includes('*') ||
    userPermissions.includes(Permission.MANAGE_SETTINGS) ||
    userPermissions.includes(Permission.SYSTEM_ROOT)
  ) {
    return true;
  }
  return userPermissions.includes(requiredPermission as string);
}
