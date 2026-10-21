export function canAccessTenantUsers(caller: {
  organizationId?: string | null;
  isSuperAdmin?: boolean;
  role?: string;
}, targetOrgId: string): boolean {
  if (!caller) return false;
  return (
    caller.organizationId === targetOrgId ||
    Boolean(caller.isSuperAdmin) ||
    caller.role === 'SuperAdmin' ||
    caller.role === 'Platform SuperAdmin'
  );
}

export function sanitizeUserProfile(user: any) {
  if (!user) return null;
  const { passwordHash, twoFactorSecret, backupCodes, ...safeUser } = user;
  return safeUser;
}
