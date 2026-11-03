import crypto from 'node:crypto';

export const MANDATORY_2FA_ROLES = [
  'SuperAdmin',
  'SUPER_ADMIN',
  'SUPERADMIN',
  'PLATFORM_SUPERADMIN',
  'Platform SuperAdmin',
  'Company Owner/GM',
  'Company Owner / GM',
  'COMPANY_OWNER_GM',
  'General Manager (GM)',
  'Financial Accountant',
  'FINANCIAL_ACCOUNTANT',
  'Chief Financial Officer / Accountant',
  'CFO_ACCOUNTANT',
  'CFO',
];

export function isMandatory2FaRole(role?: string): boolean {
  if (!role) return false;
  if (MANDATORY_2FA_ROLES.includes(role)) return true;
  const upper = role.toUpperCase().replace(/[^A-Z]/g, '_');
  return (
    upper.includes('SUPERADMIN') ||
    upper.includes('SUPER_ADMIN') ||
    upper.includes('OWNER') ||
    upper.includes('GENERAL_MANAGER') ||
    upper.includes('GM') ||
    upper.includes('CFO') ||
    upper.includes('ACCOUNTANT') ||
    upper.includes('FINANCIAL')
  );
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
