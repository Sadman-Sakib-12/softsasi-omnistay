import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IAccountingRepository } from '../../domain/repositories/accounting.repository.interface.js';

@Injectable()
export class PrismaAccountingRepository implements IAccountingRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Chart of Accounts
  async findAccounts(tenantId: string, type?: string): Promise<any[]> {
    const where: any = { tenantId, deletedAt: null };
    if (type) where.type = type;
    return this.prisma.chartOfAccount.findMany({
      where,
      orderBy: { code: 'asc' },
    });
  }

  async findAccountById(id: string, tenantId: string): Promise<any | null> {
    return this.prisma.chartOfAccount.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
  }

  async findAccountByCode(tenantId: string, code: string): Promise<any | null> {
    return this.prisma.chartOfAccount.findFirst({
      where: { tenantId, code, deletedAt: null },
    });
  }

  async createAccount(data: any): Promise<any> {
    return this.prisma.chartOfAccount.create({ data });
  }

  async updateAccount(id: string, data: any): Promise<any> {
    return this.prisma.chartOfAccount.update({
      where: { id },
      data,
    });
  }

  // Journal Entries
  async findJournalEntries(tenantId: string, limit = 50): Promise<any[]> {
    return this.prisma.journalEntry.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        items: {
          include: { account: { select: { code: true, name: true, type: true } } },
        },
      },
    });
  }

  async findJournalEntryById(id: string, tenantId: string): Promise<any | null> {
    return this.prisma.journalEntry.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: { account: true },
        },
      },
    });
  }

  async createJournalEntry(data: any): Promise<any> {
    return this.prisma.journalEntry.create({
      data,
      include: {
        items: {
          include: { account: { select: { code: true, name: true, type: true } } },
        },
      },
    });
  }

  // Invoices (AR)
  async findInvoices(tenantId: string, status?: string): Promise<any[]> {
    const where: any = { tenantId, deletedAt: null };
    if (status) where.status = status;
    return this.prisma.invoice.findMany({
      where,
      orderBy: { issueDate: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: true,
        payments: true,
      },
    });
  }

  async findInvoiceById(id: string, tenantId: string): Promise<any | null> {
    return this.prisma.invoice.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: true,
        payments: true,
        creditNotes: true,
      },
    });
  }

  async createInvoice(data: any): Promise<any> {
    return this.prisma.invoice.create({
      data,
      include: { items: true },
    });
  }

  async updateInvoice(id: string, data: any): Promise<any> {
    return this.prisma.invoice.update({
      where: { id },
      data,
    });
  }

  async createInvoicePayment(data: any): Promise<any> {
    return this.prisma.invoicePayment.create({ data });
  }

  // Bills (AP)
  async findBills(tenantId: string, status?: string): Promise<any[]> {
    const where: any = { tenantId, deletedAt: null };
    if (status) where.status = status;
    return this.prisma.bill.findMany({
      where,
      orderBy: { billDate: 'desc' },
      include: {
        items: true,
        payments: true,
      },
    });
  }

  async findBillById(id: string, tenantId: string): Promise<any | null> {
    return this.prisma.bill.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        items: true,
        payments: true,
      },
    });
  }

  async createBill(data: any): Promise<any> {
    return this.prisma.bill.create({
      data,
      include: { items: true },
    });
  }

  async updateBill(id: string, data: any): Promise<any> {
    return this.prisma.bill.update({
      where: { id },
      data,
    });
  }

  async createBillPayment(data: any): Promise<any> {
    return this.prisma.billPayment.create({ data });
  }

  // Bank & Treasury
  async findBankAccounts(tenantId: string): Promise<any[]> {
    return this.prisma.bankAccount.findMany({
      where: { tenantId, deletedAt: null },
      include: { chartOfAccount: { select: { code: true, name: true } } },
      orderBy: { accountName: 'asc' },
    });
  }

  async findBankAccountById(id: string, tenantId: string): Promise<any | null> {
    return this.prisma.bankAccount.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        chartOfAccount: true,
      },
    });
  }

  async createBankAccount(data: any): Promise<any> {
    return this.prisma.bankAccount.create({ data });
  }

  async createBankTransfer(data: any): Promise<any> {
    return this.prisma.bankTransfer.create({ data });
  }

  async createCashRegisterShift(data: any): Promise<any> {
    return this.prisma.cashRegisterShift.create({ data });
  }

  async updateCashRegisterShift(id: string, data: any): Promise<any> {
    return this.prisma.cashRegisterShift.update({
      where: { id },
      data,
    });
  }

  // Night Audit
  async findNightAuditRuns(tenantId: string): Promise<any[]> {
    return this.prisma.nightAuditRun.findMany({
      where: { tenantId },
      orderBy: { auditDate: 'desc' },
      take: 30,
    });
  }

  async findNightAuditRunByDate(tenantId: string, date: Date): Promise<any | null> {
    return this.prisma.nightAuditRun.findFirst({
      where: { tenantId, auditDate: date, status: 'completed' },
    });
  }

  async createNightAuditRun(data: any): Promise<any> {
    return this.prisma.nightAuditRun.create({ data });
  }

  async updateNightAuditRun(id: string, data: any): Promise<any> {
    return this.prisma.nightAuditRun.update({
      where: { id },
      data,
    });
  }
}
