/**
 * Re-exporting enterprise roles and permissions from @omnistay/shared-types
 * Single source of truth for IAM across Admin, Backend, and Web.
 */
export {
  Role,
  Permission,
  ROLE_LABELS,
  ROLE_ROUTE_PERMISSIONS,
  isRouteAllowedForRole,
  normalizeRole,
  hasPermission,
} from '@omnistay/shared-types';
