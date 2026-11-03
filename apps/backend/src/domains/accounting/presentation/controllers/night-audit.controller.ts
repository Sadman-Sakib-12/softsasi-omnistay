import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NightAuditService } from '../../application/services/night-audit.service.js';
import { RunNightAuditDto } from '../dto/night-audit.dto.js';
import { JwtAuthGuard, CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Accounting - Night Audit (Chapter 7.2)')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/accounting/night-audit')
export class NightAuditController {
  constructor(private readonly nightAuditService: NightAuditService) {}

  @Get('history')
  @ApiOperation({ summary: 'List past Night Audit run history & trial balance snapshots' })
  async listHistory(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.nightAuditService.listAuditHistory(user.organizationId || '');
  }

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger Automated Night Audit Run for Tenant',
    description: 'Accrues room revenue for all occupied rooms, posts GL journals (Debit Guest Folio, Credit Room Revenue + Tax), releases unearned booking deposits, and validates that Trial Balance reconciles to zero.',
  })
  @ApiResponse({ status: 200, description: 'Night audit successfully executed with zero-variance trial balance reconciliation' })
  async runAudit(
    @Body(new ValidationPipe({ whitelist: true })) dto: RunNightAuditDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.nightAuditService.runNightAudit(user.organizationId || '', dto);
  }

  @Post('auto-run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '02:00 AM Night Audit Scheduler Batch Runner',
    description: 'Daemon trigger that iterates across all active multi-tenant hotel partitions, accrues revenues, posts double-entry USALI journals, and stores trial balance snapshots.',
  })
  @ApiResponse({ status: 200, description: 'Batch night audit run completed across hotel partitions' })
  async autoRunAll(
    @Body() body: { auditDate?: string; forceRun?: boolean; allTenants?: boolean },
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    const isSuperAdmin = user.isSuperAdmin || user.role === 'SuperAdmin' || user.role === 'Platform SuperAdmin';
    const targetTenantId = (isSuperAdmin && body.allTenants) ? undefined : (user.organizationId || undefined);

    return this.nightAuditService.runNightAuditForAllTenants({
      auditDate: body?.auditDate,
      forceRun: body?.forceRun,
      tenantId: targetTenantId,
    });
  }
}
