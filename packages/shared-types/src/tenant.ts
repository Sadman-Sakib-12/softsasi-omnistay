/**
 * Softsasi OmniStay 360 - Tenant & Organization Contracts
 * Source of truth: Sakib_Project_Plan.pdf (Chapter 3 §3.2, Chapter 19 §19.1–19.2)
 */

export const TenantStatuses = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  TRIAL: 'trial',
} as const;

export type TenantStatus = (typeof TenantStatuses)[keyof typeof TenantStatuses];

export const UserStatuses = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
} as const;

export type UserStatus = (typeof UserStatuses)[keyof typeof UserStatuses];

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  subdomain?: string | null;
  status: TenantStatus | string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  status: UserStatus | string;
  isTwoFactorEnabled: boolean;
}

export interface MembershipSummary {
  organizationId: string;
  name: string;
  slug: string;
  role: string;
  permissions: string[];
  joinedAt: Date | string;
}
