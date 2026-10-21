export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getDefaultOwnerPermissions(): string[] {
  return [
    'properties:manage',
    'rooms:manage',
    'rates:manage',
    'reservations:manage',
    'staff:manage',
    'finance:read',
    'reports:view',
  ];
}

export function isPlatformAdmin(user: {
  isSuperAdmin?: boolean;
  role?: string;
  permissions?: string[];
}): boolean {
  if (!user) return false;
  return (
    Boolean(user.isSuperAdmin) ||
    user.role === 'SuperAdmin' ||
    user.role === 'Platform SuperAdmin' ||
    (Array.isArray(user.permissions) &&
      (user.permissions.includes('system:root') ||
        user.permissions.includes('tenant:manage') ||
        user.permissions.includes('tenant:audit') ||
        user.permissions.includes('tenant:create')))
  );
}
