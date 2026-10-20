import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AppService } from './app.service.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { RolesGuard } from '@omnistay/backend-common';
import { PermissionsGuard } from '@omnistay/backend-common';
import { TenantGuard } from '@omnistay/backend-common';
import { Roles } from '@omnistay/backend-common';
import { RequirePermissions } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Platform SuperAdmin')
  @Get('api/v1/admin/superadmin-only')
  getSuperAdminOnly(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'SuperAdmin access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Company Owner/GM', 'Company Owner / GM', 'General Manager (GM)')
  @Get('api/v1/owner/property-settings')
  getOwnerSettings(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'Owner settings access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'Financial Accountant',
    'Chief Financial Officer / Accountant',
    'Company Owner/GM',
    'Company Owner / GM',
    'General Manager (GM)',
  )
  @Get('api/v1/finance/reports')
  getFinancialReports(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'Financial reports access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Front Desk Agent', 'Company Owner/GM', 'Company Owner / GM', 'General Manager (GM)')
  @Get('api/v1/frontdesk/checkin')
  getFrontDeskCheckin(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'Front Desk check-in access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Housekeeping Supervisor', 'Company Owner/GM', 'Company Owner / GM', 'General Manager (GM)')
  @Get('api/v1/housekeeping/tasks')
  getHousekeepingTasks(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'Housekeeping tasks access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('POS Waiter / Cashier', 'F&B / POS Cashier', 'Company Owner/GM', 'Company Owner / GM', 'General Manager (GM)')
  @Get('api/v1/pos/terminal')
  getPosTerminal(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'POS terminal access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR Director', 'HR & Payroll Director', 'Company Owner/GM', 'Company Owner / GM', 'General Manager (GM)')
  @Get('api/v1/hrm/payroll')
  getHrmPayroll(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'HR & Payroll access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Third-Party Vendor', 'Third-Party Vendor / Host')
  @Get('api/v1/vendor/listings')
  getVendorListings(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'Vendor listings access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Maintenance Engineer', 'Company Owner/GM', 'Company Owner / GM', 'General Manager (GM)')
  @Get('api/v1/maintenance/tickets')
  getMaintenanceTickets(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'Maintenance tickets access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Guest / Traveler', 'Hotel Guest (Traveler)')
  @Get('api/v1/guest/portal')
  getGuestPortal(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'Guest portal access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('audit:export')
  @Get('api/v1/audit/export')
  getAuditExport(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'Audit export access granted', user: user.email };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('rooms:out_of_order')
  @Get('api/v1/maintenance/clear-room')
  getMaintenanceClearRoom(@CurrentUser() user: AuthenticatedUserPayload) {
    return { status: 'success', message: 'Room cleared successfully', user: user.email };
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
