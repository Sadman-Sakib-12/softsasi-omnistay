/**
 * Softsasi OmniStay 360 - Granular Capability Flags & Permissions
 * Source of truth: Sakib_Project_Plan.pdf (Chapter 3 §3.2) & existing codebase
 */

export const Permissions = {
  // System Administration
  SYSTEM_ROOT: 'system:root',
  TENANT_MANAGE: 'tenant:manage',
  TENANT_AUDIT: 'tenant:audit',
  TENANT_CREATE: 'tenant:create',
  AUDIT_EXPORT: 'audit:export',

  // Hospitality & Properties
  HOTEL_CREATE: 'hotel.create',
  PROPERTIES_MANAGE: 'properties:manage',
  ROOMS_MANAGE: 'rooms:manage',
  ROOMS_READ: 'rooms:read',
  RATES_MANAGE: 'rates:manage',
  RESERVATIONS_MANAGE: 'reservations:manage',
  RESERVATIONS_READ: 'reservations:read',

  // Financial & Folio
  FOLIO_SETTLE: 'folio.settle',
  FINANCE_READ: 'finance:read',
  JOURNAL_POST: 'journal.post',
  REPORTS_VIEW: 'reports:view',

  // POS & F&B
  POS_DISCOUNT: 'pos.discount',

  // HRM & Payroll
  STAFF_MANAGE: 'staff:manage',
  PAYROLL_RUN: 'payroll.run',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
