/**
 * Softsasi OmniStay 360 - Authentication & IAM Contracts
 * Source of truth: Sakib_Project_Plan.pdf (Chapter 19 §19.5, Chapter 20 §20.1) & existing auth domain
 */

import type { UserSummary, TenantSummary } from './tenant.js';

export const TokenTypes = {
  ACCESS: 'ACCESS',
  TWO_FACTOR_CHALLENGE: '2FA_CHALLENGE',
} as const;

export type TokenType = (typeof TokenTypes)[keyof typeof TokenTypes];

export interface AuthenticatedUserPayload {
  userId: string;
  email: string;
  name: string;
  organizationId?: string;
  role?: string;
  permissions: string[];
  isSuperAdmin: boolean;
  is2faVerified: boolean;
}

export interface JwtTokenPayload {
  sub: string;
  email: string;
  name?: string;
  organizationId?: string;
  role?: string;
  permissions?: string[];
  isSuperAdmin?: boolean;
  is2faVerified?: boolean;
  type: TokenType | string;
  jti?: string;
}

export interface Login2faChallengeResponse {
  requires2fa: true;
  tempToken: string;
  message: string;
  enrollmentRequired?: boolean;
  secret?: string;
  otpAuthUri?: string;
}

export interface FullSessionResponse {
  accessToken: string;
  refreshToken: string;
  user: UserSummary;
  organization: TenantSummary | null;
  role: string | null;
  permissions: string[];
}

export type LoginResponse = Login2faChallengeResponse | FullSessionResponse;

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Setup2faResponse {
  secret: string;
  otpAuthUri: string;
  recoveryCodes: string[];
  message: string;
}
