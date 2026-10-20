import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { randomBytes } from 'crypto';
import { CreateJournalEntryDto } from '../dto/journal.dto.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  private canManage(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Chief Financial Officer / Accountant' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.permissions.includes('accounting:manage') ||
      caller.permissions.includes('financial:write')
    );
  }

  /**
   * Creates a balanced double-entry General Ledger journal entry.
   * Strictly enforces: Total Debits === Total Credits.
   */
  async createJournalEntry(
    tenantId: string,
    dto: CreateJournalEntryDto,
    caller?: AuthenticatedUserPayload,
  ) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to create journal entries');
    }

    if (!dto.items || dto.items.length < 2) {
      throw new BadRequestException('A double-entry journal requires at least two line items (Debit and Credit)');
    }

    // Verify mathematical balance (Sum Debits == Sum Credits)
    let totalDebit = 0;
    let totalCredit = 0;

    for (const item of dto.items) {
      const d = Number(item.debit || 0);
      const c = Number(item.credit || 0);
      if (d > 0 && c > 0) {
        throw new BadRequestException('A single journal line cannot have both Debit and Credit amounts');
      }
      totalDebit += d;
      totalCredit += c;
    }

    // Round to 2 decimal places for currency precision
    totalDebit = Math.round(totalDebit * 100) / 100;
    totalCredit = Math.round(totalCredit * 100) / 100;

    if (totalDebit !== totalCredit) {
      throw new BadRequestException(
        `Double-entry imbalance: Total Debits ($${totalDebit}) must precisely equal Total Credits ($${totalCredit})`,
      );
    }

    const entryNumber = `JE-${new Date(dto.date).getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;

    return this.prisma.journalEntry.create({
      data: {
        tenantId,
        entryNumber,
        date: new Date(dto.date),
        reference: dto.reference || null,
        description: dto.description || null,
        sourceModule: dto.sourceModule || 'manual',
        isPosted: dto.isPosted ?? true,
        createdBy: caller?.userId || null,
        items: {
          create: dto.items.map((item) => ({
            accountId: item.accountId,
            debit: item.debit || 0,
            credit: item.credit || 0,
            currency: item.currency || 'USD',
            exchangeRate: item.exchangeRate || 1.0,
          })),
        },
      },
      include: {
        items: {
          include: { account: { select: { code: true, name: true, type: true } } },
        },
      },
    });
  }

  async listJournalEntries(tenantId: string, limit = 50) {
    return this.prisma.journalEntry.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        items: {
          include: { account: { select: { code: true, name: true, type: true } } },
        },
      },
    });
  }

  async getJournalEntryById(id: string, tenantId: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        items: {
          include: { account: { select: { code: true, name: true, type: true } } },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException(`Journal entry ${id} not found`);
    }
    return entry;
  }

  /**
   * Generates a Trial Balance snapshot across all general ledger accounts.
   * Acceptance Criteria: Debits precisely equal Credits (Variance reconciles to 0.00).
   */
  async getTrialBalance(tenantId: string) {
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        journalItems: {
          where: { journalEntry: { isPosted: true, deletedAt: null } },
        },
      },
      orderBy: { code: 'asc' },
    });

    let cumulativeDebits = 0;
    let cumulativeCredits = 0;

    const trialBalanceRows = accounts.map((acc) => {
      let accDebits = 0;
      let accCredits = 0;

      for (const item of acc.journalItems) {
        accDebits += Number(item.debit);
        accCredits += Number(item.credit);
      }

      cumulativeDebits += accDebits;
      cumulativeCredits += accCredits;

      // Net balance calculation based on normal account balance
      let netDebit = 0;
      let netCredit = 0;
      if (['asset', 'expense'].includes(acc.type)) {
        netDebit = Math.max(0, accDebits - accCredits);
      } else {
        netCredit = Math.max(0, accCredits - accDebits);
      }

      return {
        accountId: acc.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        totalDebits: Math.round(accDebits * 100) / 100,
        totalCredits: Math.round(accCredits * 100) / 100,
        netDebit: Math.round(netDebit * 100) / 100,
        netCredit: Math.round(netCredit * 100) / 100,
      };
    });

    cumulativeDebits = Math.round(cumulativeDebits * 100) / 100;
    cumulativeCredits = Math.round(cumulativeCredits * 100) / 100;
    const variance = Math.round((cumulativeDebits - cumulativeCredits) * 100) / 100;

    return {
      totalDebits: cumulativeDebits,
      totalCredits: cumulativeCredits,
      variance,
      isReconciled: variance === 0,
      accounts: trialBalanceRows,
    };
  }
}
