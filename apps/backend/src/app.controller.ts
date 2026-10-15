import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AppService } from './app.service.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { PermissionsGuard } from './common/guards/permissions.guard.js';
import { TenantGuard } from './common/guards/tenant.guard.js';
import { Roles } from './common/decorators/roles.decorator.js';
import { RequirePermissions } from './common/decorators/permissions.decorator.js';
import { CurrentUser } from './common/decorators/current-user.decorator.js';
import type { AuthenticatedUserPayload } from './common/decorators/current-user.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  @Get('api/v1/admin/superadmin-only')
  getSuperAdminOnly(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'SuperAdmin access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Financial Accountant', 'Company Owner/GM')
  @Get('api/v1/finance/reports')
  getFinancialReports(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'Financial reports access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('audit:export')
  @Get('api/v1/audit/export')
  getAuditExport(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'Audit export access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('api/v1/tenants/:organizationId/resource')
  getTenantResource(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return {
      status: 'success',
      organizationId,
      userOrgId: user.organizationId,
      message: 'Tenant resource retrieved successfully',
    };
  }
}
