import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { AddFolioChargeDto, AddFolioPaymentDto } from '../dto/folio.dto.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class FolioService {
  constructor(private readonly prisma: PrismaService) {}

  private canManageFolios(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.role === 'General Manager (GM)' ||
      caller.role === 'Front Desk Agent' ||
      caller.role === 'Chief Financial Officer / Accountant' ||
      caller.role === 'Financial Accountant' ||
      caller.role === 'F&B / POS Cashier' ||
      caller.role === 'POS Waiter / Cashier' ||
      caller.permissions.includes('folios:manage') ||
      caller.permissions.includes('finance:write') ||
      caller.permissions.includes('pos:charge')
    );
  }

  /**
   * Retrieves single guest folio with transaction ledger.
   */
  async getFolioById(id: string, organizationId?: string) {
    const folio = await this.prisma.guestFolio.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            tenantId: true,
            bookingCode: true,
            guest: { select: { id: true, name: true, email: true } },
            property: { select: { id: true, name: true, currency: true } },
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!folio) {
      throw new NotFoundException('Guest folio not found');
    }

    if (organizationId && folio.booking.tenantId !== organizationId) {
      throw new ForbiddenException('Cross-tenant data access denied: Folio belongs to another organization');
    }

    return folio;
  }

  /**
   * Posts an itemized charge to the guest folio (e.g. room service dining, spa, minibar).
   */
  async addCharge(
    folioId: string,
    dto: AddFolioChargeDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const folio = await this.getFolioById(folioId, organizationId);

    if (!this.canManageFolios(caller)) {
      throw new ForbiddenException('Insufficient permissions to post folio charges');
    }

    if (folio.status === 'closed' || folio.status === 'audited') {
      throw new BadRequestException(`Cannot post charges to a folio with status '${folio.status}'`);
    }

    const chargeAmount = Number(dto.amount);
    const newTotalCharges = Math.round((Number(folio.totalCharges) + chargeAmount) * 100) / 100;
    const newBalanceDue = Math.round((Number(folio.balanceDue) + chargeAmount) * 100) / 100;

    const [transaction, updatedFolio] = await this.prisma.$transaction([
      this.prisma.folioTransaction.create({
        data: {
          folioId,
          transactionType: 'charge',
          department: dto.department,
          amount: chargeAmount,
        },
      }),
      this.prisma.guestFolio.update({
        where: { id: folioId },
        data: {
          totalCharges: newTotalCharges,
          balanceDue: newBalanceDue,
        },
      }),
    ]);

    return {
      message: 'Charge posted to folio successfully',
      transactionId: transaction.id,
      department: transaction.department,
      amount: chargeAmount,
      balanceDue: newBalanceDue,
      folio: updatedFolio,
    };
  }

  /**
   * Posts a payment settlement to the guest folio.
   */
  async addPayment(
    folioId: string,
    dto: AddFolioPaymentDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const folio = await this.getFolioById(folioId, organizationId);

    if (!this.canManageFolios(caller)) {
      throw new ForbiddenException('Insufficient permissions to settle folio payments');
    }

    if (folio.status === 'audited') {
      throw new BadRequestException('Cannot modify audited folio');
    }

    const paymentAmount = Number(dto.amount);
    const newTotalPayments = Math.round((Number(folio.totalPayments) + paymentAmount) * 100) / 100;
    const newBalanceDue = Math.max(0, Math.round((Number(folio.balanceDue) - paymentAmount) * 100) / 100);

    const [transaction, updatedFolio] = await this.prisma.$transaction([
      this.prisma.folioTransaction.create({
        data: {
          folioId,
          transactionType: 'payment',
          department: 'frontdesk',
          amount: paymentAmount,
        },
      }),
      this.prisma.guestFolio.update({
        where: { id: folioId },
        data: {
          totalPayments: newTotalPayments,
          balanceDue: newBalanceDue,
          status: newBalanceDue === 0 ? 'closed' : folio.status,
        },
      }),
    ]);

    // If fully settled, update booking payment status
    if (newBalanceDue === 0) {
      await this.prisma.booking.update({
        where: { id: folio.bookingId },
        data: { paymentStatus: 'paid' },
      });
    }

    return {
      message: 'Payment credited to folio successfully',
      transactionId: transaction.id,
      paymentMethod: dto.paymentMethod,
      amount: paymentAmount,
      balanceDue: newBalanceDue,
      folio: updatedFolio,
    };
  }
}
