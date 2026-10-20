import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChartOfAccountsService } from './coa.service.js';
import { JournalService } from './journal.service.js';
import { NightAuditService } from './night-audit.service.js';
import { AccountsReceivableService } from './ar.service.js';
import { AccountsPayableService } from './ap.service.js';
import { BankAndTreasuryService } from './bank.service.js';
import { FinancialReportService } from './financial-report.service.js';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('Phase 4: Double-Entry Financial Accounting & Treasury', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      chartOfAccount: {
        count: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      journalEntry: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      journalItem: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      nightAuditRun: {
        findFirst: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
      },
      nightAuditSnapshot: {
        create: vi.fn(),
      },
      booking: {
        findMany: vi.fn(),
      },
      invoice: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      invoicePayment: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      bill: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      billPayment: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      debitNote: {
        create: vi.fn(),
      },
      bankAccount: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      bankTransfer: {
        create: vi.fn(),
      },
      cashRegisterShift: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      bankStatement: {
        create: vi.fn(),
      },
      bankReconciliation: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      bankReconciliationMatch: {
        create: vi.fn(),
      },
    };
  });

  describe('7.1 USALI Chart of Accounts Service', () => {
    let service: ChartOfAccountsService;

    beforeEach(() => {
      service = new ChartOfAccountsService(mockPrisma);
    });

    it('should pre-seed USALI accounts if tenant chart of accounts is empty', async () => {
      mockPrisma.chartOfAccount.count.mockResolvedValue(0);
      mockPrisma.chartOfAccount.create.mockResolvedValue({});
      mockPrisma.chartOfAccount.findMany.mockResolvedValue([
        { id: 'acc-1', code: '1010', name: 'Operating Bank Account', type: 'asset' },
      ]);

      const result = await service.listAccounts('tenant-1');
      expect(mockPrisma.chartOfAccount.create).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should throw ConflictException on duplicate account code', async () => {
      mockPrisma.chartOfAccount.count.mockResolvedValue(10);
      mockPrisma.chartOfAccount.findFirst.mockResolvedValue({ id: 'acc-1', code: '1010' });

      await expect(
        service.createAccount('tenant-1', {
          code: '1010',
          name: 'Duplicate Bank',
          type: 'asset',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('7.2 General Ledger & Double-Entry Integrity', () => {
    let service: JournalService;

    beforeEach(() => {
      service = new JournalService(mockPrisma);
    });

    it('should successfully post balanced journal entry when Debits equal Credits', async () => {
      mockPrisma.journalEntry.create.mockImplementation(({ data }) => Promise.resolve({ id: 'je-1', ...data }));

      const caller: any = { isSuperAdmin: true, permissions: [] };
      const entry = await service.createJournalEntry(
        'tenant-1',
        {
          date: '2026-11-01',
          reference: 'REF-001',
          items: [
            { accountId: 'acc-debit', debit: 500, credit: 0 },
            { accountId: 'acc-credit', debit: 0, credit: 500 },
          ],
        },
        caller,
      );

      expect(entry.id).toBe('je-1');
      expect(entry.isPosted).toBe(true);
      expect(entry.entryNumber).toMatch(/^JE-2026-[A-F0-9]{8}$/);
    });

    it('should reject unbalanced journal entry with BadRequestException', async () => {
      const caller: any = { isSuperAdmin: true, permissions: [] };

      await expect(
        service.createJournalEntry(
          'tenant-1',
          {
            date: '2026-11-01',
            items: [
              { accountId: 'acc-debit', debit: 500, credit: 0 },
              { accountId: 'acc-credit', debit: 0, credit: 400 }, // imbalance of 100
            ],
          },
          caller,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should calculate Trial Balance snapshot and verify Debits equal Credits with zero variance', async () => {
      mockPrisma.chartOfAccount.findMany.mockResolvedValue([
        {
          id: 'acc-1',
          code: '1010',
          name: 'Operating Bank',
          type: 'asset',
          journalItems: [{ debit: 1000, credit: 200 }],
        },
        {
          id: 'acc-2',
          code: '4010',
          name: 'Room Revenue',
          type: 'revenue',
          journalItems: [{ debit: 0, credit: 800 }],
        },
      ]);

      const tb = await service.getTrialBalance('tenant-1');
      expect(tb.totalDebits).toBe(1000);
      expect(tb.totalCredits).toBe(1000);
      expect(tb.variance).toBe(0);
      expect(tb.isReconciled).toBe(true);
    });
  });

  describe('7.2 & 21.1 Automated Night Audit Engine (Acceptance Criteria)', () => {
    let nightAuditService: NightAuditService;
    let coaService: ChartOfAccountsService;
    let journalService: JournalService;

    beforeEach(() => {
      coaService = new ChartOfAccountsService(mockPrisma);
      journalService = new JournalService(mockPrisma);
      nightAuditService = new NightAuditService(mockPrisma, coaService, journalService);
    });

    it('should automatically post room revenue accrual, release advances, and reconcile trial balance to zero', async () => {
      // Setup COA accounts
      mockPrisma.chartOfAccount.count.mockResolvedValue(20);
      mockPrisma.chartOfAccount.findFirst.mockImplementation(({ where }) => {
        return Promise.resolve({ id: `acc-uuid-${where.code}`, code: where.code, name: `Account ${where.code}` });
      });
      mockPrisma.nightAuditRun.findFirst.mockResolvedValue(null);

      // Active bookings
      mockPrisma.booking.findMany.mockResolvedValue([
        {
          id: 'bk-1',
          totalAmount: 600,
          depositAmount: 150,
          checkInDate: new Date('2026-11-01'),
          checkOutDate: new Date('2026-11-04'), // 3 nights -> 200/night
          folios: [{ id: 'fol-1' }],
        },
      ]);

      // Journal entry creation
      mockPrisma.journalEntry.create
        .mockResolvedValueOnce({ id: 'je-accrual' })
        .mockResolvedValueOnce({ id: 'je-advance' });

      // Mock trial balance query returning balanced numbers
      mockPrisma.chartOfAccount.findMany.mockResolvedValue([
        {
          id: 'acc-uuid-1100',
          code: '1100',
          name: 'Guest Folio AR',
          type: 'asset',
          journalItems: [{ debit: 210, credit: 0 }],
        },
        {
          id: 'acc-uuid-4010',
          code: '4010',
          name: 'Room Revenue',
          type: 'revenue',
          journalItems: [{ debit: 0, credit: 200 }],
        },
        {
          id: 'acc-uuid-2250',
          code: '2250',
          name: 'City Lodging Tax',
          type: 'liability',
          journalItems: [{ debit: 0, credit: 10 }],
        },
      ]);

      mockPrisma.nightAuditRun.create.mockResolvedValue({ id: 'nar-1' });

      const result = await nightAuditService.runNightAudit('tenant-1', { auditDate: '2026-11-01' });

      expect(result.success).toBe(true);
      expect(result.roomsAudited).toBe(1);
      expect(result.revenuePosted).toBe(200);
      expect(result.taxAccrued).toBe(10);
      expect(result.totalFolioDebit).toBe(210);
      expect(result.trialBalanceStatus.variance).toBe(0);
      expect(result.trialBalanceStatus.reconciledToZero).toBe(true);
      expect(mockPrisma.nightAuditRun.create).toHaveBeenCalled();
    });
  });

  describe('7.3 Accounts Receivable & Corporate Direct Billing', () => {
    let service: AccountsReceivableService;

    beforeEach(() => {
      service = new AccountsReceivableService(mockPrisma);
    });

    it('should create corporate invoice with sequential number and tax computation', async () => {
      mockPrisma.invoice.create.mockImplementation(({ data }) => Promise.resolve({ id: 'inv-1', ...data }));

      const caller: any = { role: 'Chief Financial Officer / Accountant', permissions: [] };
      const invoice = await service.createInvoice(
        'tenant-1',
        {
          customerId: 'cust-1',
          issueDate: '2026-11-01',
          dueDate: '2026-11-30',
          items: [{ description: 'Conference Rooms', quantity: 5, unitPrice: 200, taxAmount: 50 }],
        },
        caller,
      );

      expect(invoice.id).toBe('inv-1');
      expect(invoice.subtotal).toBe(1000);
      expect(invoice.taxTotal).toBe(50);
      expect(invoice.grandTotal).toBe(1050);
      expect(invoice.status).toBe('sent');
    });

    it('should calculate Accounts Receivable Aging across Current, 1-30, 31-60, 61-90, 90+ days brackets', async () => {
      const now = new Date();
      const past20Days = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
      const past45Days = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
      const past100Days = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000);

      mockPrisma.invoice.findMany.mockResolvedValue([
        {
          id: 'inv-1',
          customerId: 'cust-1',
          dueDate: past20Days,
          grandTotal: 1000,
          payments: [],
          customer: { name: 'Acme Corp', email: 'acme@corp.com' },
        },
        {
          id: 'inv-2',
          customerId: 'cust-2',
          dueDate: past45Days,
          grandTotal: 2000,
          payments: [{ amount: 500 }], // 1500 remaining
          customer: { name: 'Beta LLC', email: 'beta@corp.com' },
        },
        {
          id: 'inv-3',
          customerId: 'cust-3',
          dueDate: past100Days,
          grandTotal: 5000,
          payments: [],
          customer: { name: 'Delta Airlines', email: 'crew@delta.com' },
        },
      ]);

      const aging = await service.getAgingReport('tenant-1');
      expect(aging.summary.days1To30).toBe(1000);
      expect(aging.summary.days31To60).toBe(1500);
      expect(aging.summary.days90PlusBadDebt).toBe(5000);
      expect(aging.totalReceivable).toBe(7500);
      expect(aging.customers).toHaveLength(3);
    });
  });

  describe('7.4 Accounts Payable & 3-Way Invoice Matching', () => {
    let service: AccountsPayableService;

    beforeEach(() => {
      service = new AccountsPayableService(mockPrisma);
    });

    it('should verify 3-Way match between Vendor Bill, PO, and GRN', async () => {
      mockPrisma.bill.findFirst.mockResolvedValue({
        id: 'bill-1',
        billNumber: 'BILL-4029',
        purchaseOrderId: 'po-101',
        grandTotal: 1500,
      });

      const match = await service.performThreeWayMatch('tenant-1', {
        billId: 'bill-1',
        purchaseOrderId: 'po-101',
        grnId: 'grn-808',
      });

      expect(match.status).toBe('verified_3_way_matched');
      expect(match.canReleasePayment).toBe(true);
      expect(match.totalBilled).toBe(1500);
    });
  });

  describe('7.5 & 7.6 Banking, Cash Registers & Bank Reconciliation', () => {
    let service: BankAndTreasuryService;

    beforeEach(() => {
      service = new BankAndTreasuryService(mockPrisma);
    });

    it('should transfer funds between bank accounts with wire fee deduction', async () => {
      mockPrisma.bankAccount.findFirst
        .mockResolvedValueOnce({ id: 'acc-src', currentBalance: 10000 })
        .mockResolvedValueOnce({ id: 'acc-dest', currentBalance: 2000 });
      mockPrisma.bankAccount.update.mockResolvedValue({});
      mockPrisma.bankTransfer.create.mockResolvedValue({ id: 'bt-1', amount: 3000, fee: 20 });

      const caller: any = { isSuperAdmin: true, permissions: [] };
      const transfer = await service.transferFunds(
        'tenant-1',
        {
          fromAccountId: 'acc-src',
          toAccountId: 'acc-dest',
          amount: 3000,
          date: '2026-11-05',
          fee: 20,
        },
        caller,
      );

      expect(transfer.id).toBe('bt-1');
      expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'acc-src' },
          data: { currentBalance: { decrement: 3020 } },
        }),
      );
    });

    it('should balance front-desk cash register shift float ($500 float) and closing cash', async () => {
      mockPrisma.cashRegisterShift.create.mockResolvedValue({ id: 'shift-1', openingFloat: 500 });
      mockPrisma.cashRegisterShift.findUnique.mockResolvedValue({ id: 'shift-1', openingFloat: 500 });
      mockPrisma.cashRegisterShift.update.mockResolvedValue({ id: 'shift-1', openingFloat: 500, closingCash: 1250 });

      const open = await service.openCashRegisterShift({ registerId: 'reg-1', openingFloat: 500 }, 'cashier-1');
      expect(open.openingFloat).toBe(500);

      const close = await service.closeCashRegisterShift({ shiftId: 'shift-1', closingCash: 1250 });
      expect(close.openingFloat).toBe(500);
      expect(close.closingCash).toBe(1250);
      expect(close.netDrawerCash).toBe(750); // 1250 - 500
      expect(close.status).toBe('closed_and_balanced');
    });

    it('should perform automated bank statement reconciliation rule matching', async () => {
      mockPrisma.bankReconciliation.findFirst.mockResolvedValue({
        id: 'recon-1',
        statementId: 'stmt-1',
      });
      mockPrisma.bankReconciliationMatch.create.mockResolvedValue({ id: 'm-1' });
      mockPrisma.bankReconciliation.update.mockResolvedValue({});

      const result = await service.reconcileStatement({ statementId: 'stmt-1', toleranceDays: 2 });
      expect(result.status).toBe('reconciled');
      expect(result.matchedItemsCount).toBe(1);
    });
  });

  describe('7.8 Real-Time Financial Statements & Executive Reports', () => {
    let service: FinancialReportService;
    let coaService: ChartOfAccountsService;

    beforeEach(() => {
      coaService = new ChartOfAccountsService(mockPrisma);
      service = new FinancialReportService(mockPrisma, coaService);
    });

    it('should generate USALI Profit & Loss statement with GOP calculation', async () => {
      mockPrisma.chartOfAccount.count.mockResolvedValue(20);
      mockPrisma.chartOfAccount.findMany.mockResolvedValue([
        { code: '4010', type: 'revenue', subType: 'room_revenue', journalItems: [{ credit: 50000, debit: 0 }] },
        { code: '4100', type: 'revenue', subType: 'f_and_b_revenue', journalItems: [{ credit: 15000, debit: 0 }] },
        { code: '5010', type: 'expense', subType: 'cogs', journalItems: [{ debit: 5000, credit: 0 }] },
        { code: '6010', type: 'expense', subType: 'opex', journalItems: [{ debit: 12000, credit: 0 }] },
        { code: '6100', type: 'expense', subType: 'opex', journalItems: [{ debit: 3000, credit: 0 }] },
      ]);

      const pnl = await service.getProfitAndLoss('tenant-1');
      expect(pnl.reportingStandard).toContain('USALI');
      expect(pnl.revenue.roomRevenue).toBe(50000);
      expect(pnl.revenue.foodAndBeverage).toBe(15000);
      expect(pnl.revenue.totalRevenue).toBe(65000);
      expect(pnl.directExpenses.costOfGoodsSold).toBe(5000);
      expect(pnl.directExpenses.grossOperatingMargin).toBe(60000); // 65000 - 5000
      expect(pnl.operatingExpenses.laborAndPayroll).toBe(12000);
      expect(pnl.operatingExpenses.totalOpex).toBe(15000); // 12000 + 3000
      expect(pnl.summary.grossOperatingProfit).toBe(45000); // 60000 - 15000
      expect(pnl.summary.netProfit).toBe(45000);
    });

    it('should generate Balance Sheet where Assets equal Liabilities + Equity', async () => {
      mockPrisma.chartOfAccount.count.mockResolvedValue(20);
      mockPrisma.chartOfAccount.findMany.mockResolvedValue([
        { code: '1010', type: 'asset', subType: 'current_asset', journalItems: [{ debit: 50000, credit: 0 }] },
        { code: '1500', type: 'asset', subType: 'fixed_asset', journalItems: [{ debit: 150000, credit: 0 }] },
        { code: '2010', type: 'liability', subType: 'current_liability', journalItems: [{ credit: 30000, debit: 0 }] },
        { code: '3010', type: 'equity', subType: 'equity', journalItems: [{ credit: 170000, debit: 0 }] },
      ]);

      const bs = await service.getBalanceSheet('tenant-1');
      expect(bs.assets.totalAssets).toBe(200000); // 50000 + 150000
      expect(bs.liabilities.totalLiabilities).toBe(30000);
      expect(bs.equity.shareholderEquity).toBe(170000);
      expect(bs.equity.totalLiabilitiesAndEquity).toBe(200000);
      expect(bs.isBalanced).toBe(true);
    });
  });
});
