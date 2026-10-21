import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Repositories
import { ACCOUNTING_REPOSITORY_TOKEN } from './domain/repositories/accounting.repository.interface.js';
import { PrismaAccountingRepository } from './infrastructure/repositories/prisma-accounting.repository.js';

// Controllers
import { ChartOfAccountsController } from './presentation/controllers/coa.controller.js';
import { JournalController } from './presentation/controllers/journal.controller.js';
import { NightAuditController } from './presentation/controllers/night-audit.controller.js';
import { AccountsReceivableController } from './presentation/controllers/ar.controller.js';
import { AccountsPayableController } from './presentation/controllers/ap.controller.js';
import { BankAndTreasuryController } from './presentation/controllers/bank.controller.js';
import { FinancialReportController } from './presentation/controllers/financial-report.controller.js';

// Services
import { ChartOfAccountsService } from './application/services/coa.service.js';
import { JournalService } from './application/services/journal.service.js';
import { NightAuditService } from './application/services/night-audit.service.js';
import { AccountsReceivableService } from './application/services/ar.service.js';
import { AccountsPayableService } from './application/services/ap.service.js';
import { BankAndTreasuryService } from './application/services/bank.service.js';
import { FinancialReportService } from './application/services/financial-report.service.js';

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
    {
      provide: ACCOUNTING_REPOSITORY_TOKEN,
      useClass: PrismaAccountingRepository,
    },
    PrismaAccountingRepository,
    ChartOfAccountsService,
    JournalService,
    NightAuditService,
    AccountsReceivableService,
    AccountsPayableService,
    BankAndTreasuryService,
    FinancialReportService,
  ],
  exports: [
    ACCOUNTING_REPOSITORY_TOKEN,
    PrismaAccountingRepository,
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
