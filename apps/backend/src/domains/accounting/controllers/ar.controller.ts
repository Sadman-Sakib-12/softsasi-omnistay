import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccountsReceivableService } from '../services/ar.service.js';
import { CreateInvoiceDto, RecordInvoicePaymentDto } from '../dto/ar-billing.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Accounting - Accounts Receivable')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/accounting/ar')
export class AccountsReceivableController {
  constructor(private readonly arService: AccountsReceivableService) {}

  @Get('invoices')
  @ApiOperation({ summary: 'List customer/corporate invoices' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status: draft, sent, partial, paid' })
  async listInvoices(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('status') status?: string,
  ) {
    return this.arService.listInvoices(user.organizationId || '', status);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice details by ID' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  async getInvoice(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.arService.getInvoiceById(id, user.organizationId || '');
  }

  @Post('invoices')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create formal corporate / customer invoice' })
  async createInvoice(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateInvoiceDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.arService.createInvoice(user.organizationId || '', dto, user);
  }

  @Post('invoices/:id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record invoice settlement payment' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  async recordPayment(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: RecordInvoicePaymentDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.arService.recordPayment(id, user.organizationId || '', dto, user);
  }

  @Get('aging')
  @ApiOperation({
    summary: 'Get Accounts Receivable Aging Report',
    description: 'Itemizes outstanding customer balances into Current, 1-30, 31-60, 61-90, and 90+ days bad debt risk brackets.',
  })
  async getAgingReport(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.arService.getAgingReport(user.organizationId || '');
  }
}
