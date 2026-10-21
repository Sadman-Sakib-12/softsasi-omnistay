export const ACCOUNTING_REPOSITORY_TOKEN = Symbol('IAccountingRepository');

export interface IAccountingRepository {
  // Chart of Accounts
  findAccounts(tenantId: string, type?: string): Promise<any[]>;
  findAccountById(id: string, tenantId: string): Promise<any | null>;
  findAccountByCode(tenantId: string, code: string): Promise<any | null>;
  createAccount(data: any): Promise<any>;
  updateAccount(id: string, data: any): Promise<any>;

  // Journal Entries
  findJournalEntries(tenantId: string, limit?: number): Promise<any[]>;
  findJournalEntryById(id: string, tenantId: string): Promise<any | null>;
  createJournalEntry(data: any): Promise<any>;

  // Invoices (AR)
  findInvoices(tenantId: string, status?: string): Promise<any[]>;
  findInvoiceById(id: string, tenantId: string): Promise<any | null>;
  createInvoice(data: any): Promise<any>;
  updateInvoice(id: string, data: any): Promise<any>;
  createInvoicePayment(data: any): Promise<any>;

  // Bills (AP)
  findBills(tenantId: string, status?: string): Promise<any[]>;
  findBillById(id: string, tenantId: string): Promise<any | null>;
  createBill(data: any): Promise<any>;
  updateBill(id: string, data: any): Promise<any>;
  createBillPayment(data: any): Promise<any>;

  // Bank & Treasury
  findBankAccounts(tenantId: string): Promise<any[]>;
  findBankAccountById(id: string, tenantId: string): Promise<any | null>;
  createBankAccount(data: any): Promise<any>;
  createBankTransfer(data: any): Promise<any>;
  createCashRegisterShift(data: any): Promise<any>;
  updateCashRegisterShift(id: string, data: any): Promise<any>;

  // Night Audit
  findNightAuditRuns(tenantId: string): Promise<any[]>;
  findNightAuditRunByDate(tenantId: string, date: Date): Promise<any | null>;
  createNightAuditRun(data: any): Promise<any>;
  updateNightAuditRun(id: string, data: any): Promise<any>;
}
