import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { randomBytes } from 'crypto';
import { CreateInvoiceDto, RecordInvoicePaymentDto } from '../dto/ar-billing.dto.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class AccountsReceivableService {
  constructor(private readonly prisma: PrismaService) {}

  private canManage(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Chief Financial Officer / Accountant' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.permissions.includes('accounting:manage')
    );
  }

  async listInvoices(tenantId: string, status?: string) {
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

  async getInvoiceById(id: string, tenantId: string) {
    const inv = await this.prisma.invoice.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: true,
        payments: true,
        creditNotes: true,
      },
    });

    if (!inv) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return inv;
  }

  async createInvoice(tenantId: string, dto: CreateInvoiceDto, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to generate invoices');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Invoice must contain at least one line item');
    }

    let subtotal = 0;
    let taxTotal = 0;
    for (const item of dto.items) {
      const lineSubtotal = Number(item.unitPrice) * item.quantity;
      const lineTax = Number(item.taxAmount || 0);
      subtotal += lineSubtotal;
      taxTotal += lineTax;
    }

    const discountTotal = Number(dto.discountTotal || 0);
    const grandTotal = Math.round((subtotal + taxTotal - discountTotal) * 100) / 100;

    const invoiceNumber = `INV-${new Date(dto.issueDate).getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;

    return this.prisma.invoice.create({
      data: {
        tenantId,
        invoiceNumber,
        customerId: dto.customerId,
        issueDate: new Date(dto.issueDate),
        dueDate: new Date(dto.dueDate),
        subtotal,
        taxTotal,
        discountTotal,
        grandTotal,
        status: 'sent',
        createdBy: caller?.userId || null,
        items: {
          create: dto.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            taxAmount: i.taxAmount || 0,
            totalAmount: Number(i.unitPrice) * i.quantity + Number(i.taxAmount || 0),
          })),
        },
      },
      include: {
        items: true,
        customer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async recordPayment(invoiceId: string, tenantId: string, dto: RecordInvoicePaymentDto, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to record invoice payment');
    }

    const invoice = await this.getInvoiceById(invoiceId, tenantId);

    const payment = await this.prisma.invoicePayment.create({
      data: {
        invoiceId,
        amount: dto.amount,
        paymentDate: new Date(dto.paymentDate),
        method: dto.method || 'bank_transfer',
        reference: dto.reference || null,
      },
    });

    // Calculate total payments recorded so far
    const allPayments = await this.prisma.invoicePayment.findMany({ where: { invoiceId } });
    const totalPaid = allPayments.reduce((acc, p) => acc + Number(p.amount), 0);

    let newStatus = 'partial';
    if (totalPaid >= Number(invoice.grandTotal)) {
      newStatus = 'paid';
    }

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
    });

    return {
      paymentId: payment.id,
      invoiceNumber: invoice.invoiceNumber,
      amountSettled: dto.amount,
      totalPaidSoFar: totalPaid,
      balanceRemaining: Math.max(0, Number(invoice.grandTotal) - totalPaid),
      invoiceStatus: newStatus,
    };
  }

  /**
   * Calculates Accounts Receivable Aging Analysis:
   * Categorizes outstanding balances into:
   * Current, 1-30 Days, 31-60 Days, 61-90 Days, 90+ Days (Bad Debt Risk).
   */
  async getAgingReport(tenantId: string) {
    const today = new Date();

    const openInvoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: { in: ['sent', 'partial'] },
        deletedAt: null,
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        payments: true,
      },
    });

    let totalCurrent = 0;
    let total30 = 0;
    let total60 = 0;
    let total90 = 0;
    let totalOver90 = 0;

    const customersMap: Record<string, any> = {};

    for (const inv of openInvoices) {
      const totalPaid = inv.payments.reduce((acc, p) => acc + Number(p.amount), 0);
      const balance = Math.max(0, Number(inv.grandTotal) - totalPaid);

      if (balance <= 0) continue;

      const dueDate = new Date(inv.dueDate);
      const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      const custId = inv.customerId;
      if (!customersMap[custId]) {
        customersMap[custId] = {
          customerId: custId,
          customerName: inv.customer?.name || 'Corporate Account',
          email: inv.customer?.email || '',
          current: 0,
          days1To30: 0,
          days31To60: 0,
          days61To90: 0,
          days90Plus: 0,
          totalDue: 0,
        };
      }

      customersMap[custId].totalDue += balance;

      if (diffDays <= 0) {
        customersMap[custId].current += balance;
        totalCurrent += balance;
      } else if (diffDays <= 30) {
        customersMap[custId].days1To30 += balance;
        total30 += balance;
      } else if (diffDays <= 60) {
        customersMap[custId].days31To60 += balance;
        total60 += balance;
      } else if (diffDays <= 90) {
        customersMap[custId].days61To90 += balance;
        total90 += balance;
      } else {
        customersMap[custId].days90Plus += balance;
        totalOver90 += balance;
      }
    }

    const round = (val: number) => Math.round(val * 100) / 100;

    return {
      asOfDate: today.toISOString().split('T')[0],
      totalReceivable: round(totalCurrent + total30 + total60 + total90 + totalOver90),
      summary: {
        current: round(totalCurrent),
        days1To30: round(total30),
        days31To60: round(total60),
        days61To90: round(total90),
        days90PlusBadDebt: round(totalOver90),
      },
      customers: Object.values(customersMap).map((c: any) => ({
        ...c,
        current: round(c.current),
        days1To30: round(c.days1To30),
        days31To60: round(c.days31To60),
        days61To90: round(c.days61To90),
        days90Plus: round(c.days90Plus),
        totalDue: round(c.totalDue),
      })),
    };
  }
}
