import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Controllers
import { ChartOfAccountsController } from './controllers/coa.controller.js';
import { JournalController } from './controllers/journal.controller.js';
import { NightAuditController } from './controllers/night-audit.controller.js';
import { AccountsReceivableController } from './controllers/ar.controller.js';
import { AccountsPayableController } from './controllers/ap.controller.js';
import { BankAndTreasuryController } from './controllers/bank.controller.js';
import { FinancialReportController } from './controllers/financial-report.controller.js';

// Services
import { ChartOfAccountsService } from './services/coa.service.js';
import { JournalService } from './services/journal.service.js';
import { NightAuditService } from './services/night-audit.service.js';
import { AccountsReceivableService } from './services/ar.service.js';
import { AccountsPayableService } from './services/ap.service.js';
import { BankAndTreasuryService } from './services/bank.service.js';
import { FinancialReportService } from './services/financial-report.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    ChartOfAccountsController,
    JournalController,
    NightAuditController,
    AccountsReceivableController,
    AccountsPayableController,
    BankAndTreasuryController,
    FinancialReportController,
  ],
  providers: [
    ChartOfAccountsService,
    JournalService,
    NightAuditService,
    AccountsReceivableService,
    AccountsPayableService,
    BankAndTreasuryService,
    FinancialReportService,
  ],
  exports: [
    ChartOfAccountsService,
    JournalService,
    NightAuditService,
    AccountsReceivableService,
    AccountsPayableService,
    BankAndTreasuryService,
    FinancialReportService,
  ],
})
export class AccountingModule {}

export const FinancialModule = AccountingModule;
