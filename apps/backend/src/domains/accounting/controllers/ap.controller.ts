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
import { AccountsPayableService } from '../services/ap.service.js';
import {
  CreateBillDto,
  CreateDebitNoteDto,
  RecordBillPaymentDto,
  ThreeWayMatchDto,
} from '../dto/ap-vendor.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Accounting - Accounts Payable')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/accounting/ap')
export class AccountsPayableController {
  constructor(private readonly apService: AccountsPayableService) {}

  @Get('bills')
  @ApiOperation({ summary: 'List supplier/vendor bills' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter: unpaid, partial, paid' })
  async listBills(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('status') status?: string,
  ) {
    return this.apService.listBills(user.organizationId || '', status);
  }

  @Get('bills/:id')
  @ApiOperation({ summary: 'Get bill details by ID' })
  @ApiParam({ name: 'id', description: 'Bill UUID' })
  async getBill(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.apService.getBillById(id, user.organizationId || '');
  }

  @Post('bills')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log vendor invoice / bill' })
  async createBill(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateBillDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.apService.createBill(user.organizationId || '', dto, user);
  }

  @Post('3-way-match')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Perform 3-Way Invoice Matching',
    description: 'Cross-checks Vendor Bill against original Purchase Order (PO) and Goods Receipt Note (GRN) before releasing payment.',
  })
  async threeWayMatch(
    @Body(new ValidationPipe({ whitelist: true })) dto: ThreeWayMatchDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.apService.performThreeWayMatch(user.organizationId || '', dto);
  }

  @Post('bills/:id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record vendor bill payment' })
  @ApiParam({ name: 'id', description: 'Bill UUID' })
  async recordPayment(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: RecordBillPaymentDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.apService.recordPayment(id, user.organizationId || '', dto, user);
  }

  @Post('debit-notes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Issue debit note adjustment for returned/damaged supplies' })
  async createDebitNote(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateDebitNoteDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.apService.createDebitNote(user.organizationId || '', dto, user);
  }
}
