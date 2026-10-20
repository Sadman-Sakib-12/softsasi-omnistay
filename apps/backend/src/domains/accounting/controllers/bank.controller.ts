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
import { BankAndTreasuryService } from '../services/bank.service.js';
import {
  BankTransferDto,
  CloseRegisterShiftDto,
  CreateBankAccountDto,
  ImportStatementDto,
  OpenRegisterShiftDto,
  ReconcileStatementDto,
} from '../dto/bank.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Accounting - Banking & Treasury')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/accounting/banking')
export class BankAndTreasuryController {
  constructor(private readonly bankService: BankAndTreasuryService) {}

  @Get('accounts')
  @ApiOperation({ summary: 'List corporate bank accounts & cash balances' })
  async listAccounts(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.bankService.listBankAccounts(user.organizationId || '');
  }

  @Post('accounts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register corporate bank account' })
  async createAccount(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateBankAccountDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.bankService.createBankAccount(user.organizationId || '', dto, user);
  }

  @Post('transfers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Execute inter-bank fund transfer with fee tracking' })
  async transferFunds(
    @Body(new ValidationPipe({ whitelist: true })) dto: BankTransferDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.bankService.transferFunds(user.organizationId || '', dto, user);
  }

  @Post('registers/shifts/open')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Open front-desk cashier drawer shift ($500 standard float)' })
  async openShift(
    @Body(new ValidationPipe({ whitelist: true })) dto: OpenRegisterShiftDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.bankService.openCashRegisterShift(dto, user.userId);
  }

  @Post('registers/shifts/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close cashier shift and balance end-of-shift drawer cash' })
  async closeShift(@Body(new ValidationPipe({ whitelist: true })) dto: CloseRegisterShiftDto) {
    return this.bankService.closeCashRegisterShift(dto);
  }

  @Post('statements/import')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Import bank statement (OFX, QIF, CSV)' })
  async importStatement(@Body(new ValidationPipe({ whitelist: true })) dto: ImportStatementDto) {
    return this.bankService.importBankStatement(dto);
  }

  @Post('statements/reconcile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Automated Bank Reconciliation Engine',
    description: 'Matches bank credits with gateway settlement payouts and debits with vendor checks.',
  })
  async reconcileStatement(@Body(new ValidationPipe({ whitelist: true })) dto: ReconcileStatementDto) {
    return this.bankService.reconcileStatement(dto);
  }
}
