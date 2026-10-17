import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedUserPayload } from '../decorators/current-user.decorator.js';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUserPayload;
      params: Record<string, string>;
      query: Record<string, string>;
      headers: Record<string, string | undefined>;
      body?: Record<string, any>;
      tenantId?: string;
    }>();

    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Authentication required for tenant-scoped resources');
    }

    // Identify target organization from route params, query string, headers, or body
    const targetOrgId =
      request.params?.organizationId ||
      request.params?.orgId ||
      request.query?.organizationId ||
      request.query?.orgId ||
      request.headers['x-organization-id'] ||
      (request.body && typeof request.body === 'object' ? request.body.organizationId : undefined);

    // For SuperAdmin, require explicit system administrative permission before allowing cross-tenant operations
    if (user.isSuperAdmin || user.role === 'SuperAdmin' || user.role === 'Platform SuperAdmin') {
      const hasSystemAdminPerm =
        user.permissions.includes('system:root') ||
        user.permissions.includes('tenant:manage') ||
        user.permissions.includes('tenant:audit');
      if (hasSystemAdminPerm) {
        request.tenantId = targetOrgId || user.organizationId;
        return true;
      }
    }

    // If client specified a target organization, it MUST match the user's verified token organization
    if (targetOrgId && targetOrgId !== user.organizationId) {
      throw new ForbiddenException(
        'Cross-tenant data access denied: user does not belong to the requested organization',
      );
    }

    // Inject verified organizationId into request context for downstream services/repository scoping
    request.tenantId = user.organizationId;
    return true;
  }
}
