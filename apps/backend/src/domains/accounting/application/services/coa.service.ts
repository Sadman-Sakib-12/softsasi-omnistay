import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateAccountDto, UpdateAccountDto } from '../../presentation/dto/coa.dto.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

export const USALI_DEFAULT_ACCOUNTS = [
  // 1000 - 1999: Assets
  { code: '1010', name: 'Operating Bank Account (USD)', type: 'asset', subType: 'current_asset' },
  { code: '1020', name: 'Petty Cash Drawer / Front Desk Float', type: 'asset', subType: 'current_asset' },
  { code: '1030', name: 'Stripe / Merchant Clearing Account', type: 'asset', subType: 'current_asset' },
  { code: '1100', name: 'Guest Folios Accounts Receivable (AR)', type: 'asset', subType: 'current_asset' },
  { code: '1150', name: 'Employee Salary Advances', type: 'asset', subType: 'current_asset' },
  { code: '1200', name: 'F&B Food & Beverage Inventory', type: 'asset', subType: 'inventory' },
  { code: '1500', name: 'Hotel Buildings, Land & Improvements', type: 'asset', subType: 'fixed_asset' },
  { code: '1550', name: 'Furniture, Fixtures & Equipment (FF&E)', type: 'asset', subType: 'fixed_asset' },
  // 2000 - 2999: Liabilities
  { code: '2010', name: 'Accounts Payable - Trade Vendors (AP)', type: 'liability', subType: 'current_liability' },
  { code: '2050', name: 'Guest Security Deposits Held in Trust', type: 'liability', subType: 'current_liability' },
  { code: '2100', name: 'Unearned Advance Bookings Revenue', type: 'liability', subType: 'current_liability' },
  { code: '2200', name: 'Sales Tax / VAT Payable', type: 'liability', subType: 'current_liability' },
  { code: '2250', name: 'City Lodging & Tourism Tax Payable', type: 'liability', subType: 'current_liability' },
  { code: '2300', name: 'Accrued Staff Payroll & Gratuities', type: 'liability', subType: 'current_liability' },
  // 3000 - 3999: Equity
  { code: '3010', name: 'Owner Contributed Capital', type: 'equity', subType: 'equity' },
  { code: '3020', name: 'Retained Earnings', type: 'equity', subType: 'equity' },
  { code: '3030', name: 'Current Year Net Earnings', type: 'equity', subType: 'equity' },
  // 4000 - 4999: Revenue
  { code: '4010', name: 'Room Revenue - Transient', type: 'revenue', subType: 'room_revenue' },
  { code: '4020', name: 'Room Revenue - Corporate & Groups', type: 'revenue', subType: 'room_revenue' },
  { code: '4100', name: 'Food Sales - Restaurants & Room Service', type: 'revenue', subType: 'f_and_b_revenue' },
  { code: '4150', name: 'Beverage Sales - Bars & Lounges', type: 'revenue', subType: 'f_and_b_revenue' },
  { code: '4200', name: 'Spa, Wellness & Recreation Revenue', type: 'revenue', subType: 'ancillary_revenue' },
  { code: '4300', name: 'Tour, Travel & Excursion Commissions', type: 'revenue', subType: 'ancillary_revenue' },
  { code: '4400', name: 'Coworking & Event Venue Rentals', type: 'revenue', subType: 'ancillary_revenue' },
  // 5000 - 5999: Cost of Goods Sold
  { code: '5010', name: 'Cost of Raw Food Ingredients', type: 'expense', subType: 'cogs' },
  { code: '5020', name: 'Cost of Beverage & Alcohol Inventory', type: 'expense', subType: 'cogs' },
  { code: '5030', name: 'Guest Room Amenities & Toiletries Consumed', type: 'expense', subType: 'cogs' },
  // 6000 - 6999: Operating Expenses
  { code: '6010', name: 'Front Desk & Administrative Salaries', type: 'expense', subType: 'opex' },
  { code: '6020', name: 'Housekeeping Department Wages', type: 'expense', subType: 'opex' },
  { code: '6100', name: 'Utilities - Electricity, Water & Gas', type: 'expense', subType: 'opex' },
  { code: '6200', name: 'Property Maintenance, Repairs & Spoilage', type: 'expense', subType: 'opex' },
  { code: '6300', name: 'OTA Channel Manager Commissions', type: 'expense', subType: 'opex' },
  { code: '6400', name: 'Hospitality Software SaaS Subscriptions', type: 'expense', subType: 'opex' },
  { code: '6500', name: 'Marketing, Advertising & Social Ads', type: 'expense', subType: 'opex' },
];

@Injectable()
export class ChartOfAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  private canManage(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin' ||
      caller.role === 'Chief Financial Officer / Accountant' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.role === 'General Manager (GM)' ||
      caller.permissions.includes('accounting:manage') ||
      caller.permissions.includes('financial:write')
    );
  }

  /**
   * Initializes standard USALI Chart of Accounts for a tenant if not already seeded.
   */
  async ensureUsaliAccounts(tenantId: string) {
    const existing = await this.prisma.chartOfAccount.count({
      where: { tenantId, deletedAt: null },
    });

    if (existing === 0) {
      for (const acc of USALI_DEFAULT_ACCOUNTS) {
        await this.prisma.chartOfAccount.create({
          data: {
            tenantId,
            code: acc.code,
            name: acc.name,
            type: acc.type,
            subType: acc.subType,
            isActive: true,
          },
        });
      }
    }
  }

  async listAccounts(tenantId: string, type?: string) {
    await this.ensureUsaliAccounts(tenantId);

    const where: any = { tenantId, deletedAt: null };
    if (type) where.type = type;

    return this.prisma.chartOfAccount.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        parent: { select: { id: true, code: true, name: true } },
        _count: { select: { children: true, journalItems: true } },
      },
    });
  }

  async getAccountByCode(tenantId: string, code: string) {
    await this.ensureUsaliAccounts(tenantId);

    const acc = await this.prisma.chartOfAccount.findFirst({
      where: { tenantId, code, deletedAt: null },
    });
    if (!acc) {
      throw new NotFoundException(`Chart of account with code ${code} not found`);
    }
    return acc;
  }

  async createAccount(tenantId: string, dto: CreateAccountDto, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to modify Chart of Accounts');
    }

    const duplicate = await this.prisma.chartOfAccount.findFirst({
      where: { tenantId, code: dto.code, deletedAt: null },
    });
    if (duplicate) {
      throw new ConflictException(`Account with code ${dto.code} already exists`);
    }

    return this.prisma.chartOfAccount.create({
      data: {
        tenantId,
        code: dto.code,
        name: dto.name,
        type: dto.type,
        subType: dto.subType || null,
        parentId: dto.parentId || null,
        isActive: true,
      },
    });
  }

  async updateAccount(id: string, tenantId: string, dto: UpdateAccountDto, caller?: AuthenticatedUserPayload) {
    if (caller && !this.canManage(caller)) {
      throw new ForbiddenException('Insufficient permissions to modify Chart of Accounts');
    }

    const acc = await this.prisma.chartOfAccount.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!acc) {
      throw new NotFoundException('Account not found');
    }

    return this.prisma.chartOfAccount.update({
      where: { id },
      data: {
        name: dto.name,
        subType: dto.subType,
        isActive: dto.isActive,
      },
    });
  }
}
