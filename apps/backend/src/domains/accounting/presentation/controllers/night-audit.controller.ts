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
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Accounting - Night Audit')
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
    summary: 'Trigger Automated Night Audit Run',
    description: 'Accrues room revenue for all occupied rooms, posts GL journals (Debit Guest Folio, Credit Room Revenue + Tax), releases unearned booking deposits, and validates that Trial Balance reconciles to zero.',
  })
  @ApiResponse({ status: 200, description: 'Night audit successfully executed with zero-variance trial balance reconciliation' })
  async runAudit(
    @Body(new ValidationPipe({ whitelist: true })) dto: RunNightAuditDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.nightAuditService.runNightAudit(user.organizationId || '', dto);
  }
}
