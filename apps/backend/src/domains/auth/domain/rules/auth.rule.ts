import crypto from 'node:crypto';

export const MANDATORY_2FA_ROLES = [
  'SuperAdmin',
  'Platform SuperAdmin',
  'Company Owner/GM',
  'Company Owner / GM',
  'General Manager (GM)',
  'Financial Accountant',
  'Chief Financial Officer / Accountant',
];

export function isMandatory2FaRole(role?: string): boolean {
  if (!role) return false;
  return MANDATORY_2FA_ROLES.includes(role);
}

export function requiresTwoFactorAuth(role?: string, isTwoFactorEnabled?: boolean): boolean {
  return isMandatory2FaRole(role) || Boolean(isTwoFactorEnabled);
}

export function generateSecureToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
