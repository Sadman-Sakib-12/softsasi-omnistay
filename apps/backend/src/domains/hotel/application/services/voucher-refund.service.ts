import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CancelWithRefundDto } from '../../presentation/dto/voucher-refund.dto.js';
import { generateHmacSignature } from '../../../communication/domain/rules/webhook-signature.rule.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class VoucherRefundService {
  private readonly logger = new Logger(VoucherRefundService.name);
  private readonly secretKey = process.env.JWT_SECRET || 'softsasi-omnistay-qr-secure-salt';

  constructor(private readonly prisma: PrismaService) {}

  private canAccessBooking(
    bookingTenantId: string,
    organizationId?: string,
    caller?: AuthenticatedUserPayload,
  ): boolean {
    if (!caller) return false;
    if (caller.isSuperAdmin || caller.role === 'SuperAdmin' || caller.role === 'Platform SuperAdmin') {
      return true;
    }
    return Boolean(organizationId && bookingTenantId === organizationId);
  }

  /**
   * Generates a printable Travel Voucher with cryptographically signed HMAC-SHA256 QR code payload.
   * Enables contactless hotel reception self check-in scanner verification.
   */
  async generateTravelVoucher(
    bookingId: string,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        property: true,
        bookingItems: {
          include: {
            roomType: true,
          },
        },
        folios: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Reservation with ID '${bookingId}' not found`);
    }

    if (!this.canAccessBooking(booking.tenantId, organizationId, caller)) {
      throw new ForbiddenException('Cross-tenant data access denied');
    }

    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const nightsCount = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

    const guestDisplayName = booking.guest?.name || 'Valued Guest';

    // Generate tamper-proof QR code verification token signed with HMAC-SHA256
    const qrPayload = {
      bookingCode: booking.bookingCode,
      tenantId: booking.tenantId,
      guestName: guestDisplayName,
      propertyId: booking.propertyId,
      propertyName: booking.property.name,
      checkInDate: booking.checkInDate.toISOString().split('T')[0],
      checkOutDate: booking.checkOutDate.toISOString().split('T')[0],
      nights: nightsCount,
      timestamp: Date.now(),
    };

    const signature = generateHmacSignature(JSON.stringify(qrPayload), this.secretKey);
    const qrVerificationToken = Buffer.from(
      JSON.stringify({ payload: qrPayload, sig: signature }),
    ).toString('base64url');

    const totalCharges = Number(booking.totalAmount);
    const depositPaid = Number(booking.depositAmount) || totalCharges;
    const balanceDue = Math.max(0, totalCharges - depositPaid);

    const primaryItem = booking.bookingItems[0];
    const roomTypeTitle = primaryItem?.roomType?.title || 'Standard Deluxe Suite';

    return {
      voucherNumber: `VOUCH-${booking.bookingCode}`,
      bookingCode: booking.bookingCode,
      bookingStatus: booking.bookingStatus,
      issuedAt: new Date().toISOString(),
      qrVerification: {
        token: qrVerificationToken,
        scannerUrl: `/api/v1/bookings/verify/${booking.bookingCode}?token=${qrVerificationToken}`,
        algorithm: 'HMAC-SHA256',
        instructions: 'Present this signed digital QR voucher at reception for 30-second contactless check-in.',
      },
      property: {
        id: booking.property.id,
        name: booking.property.name,
        address: booking.property.address || 'OmniStay Destination Resort',
        checkInTime: booking.property.checkInTime || '14:00',
        checkOutTime: booking.property.checkOutTime || '11:00',
        contactPhone: '+1 (800) 555-OMNI',
        contactEmail: 'reception@omnistay.com',
      },
      guest: {
        id: booking.guestId,
        fullName: guestDisplayName,
        email: booking.guest?.email || 'guest@example.com',
        phone: booking.guest?.phone || 'N/A',
        adults: booking.adults,
        children: booking.children,
      },
      stay: {
        roomTypeTitle,
        checkInDate: booking.checkInDate.toISOString().split('T')[0],
        checkOutDate: booking.checkOutDate.toISOString().split('T')[0],
        nights: nightsCount,
        inclusions: [
          'Complimentary High-Speed Wi-Fi (100 Mbps)',
          'Daily Housekeeping Service',
          'Access to Swimming Pool & Fitness Center',
          'Welcome Drink at Front Lobby Lounge',
        ],
      },
      financialSummary: {
        totalAmount: totalCharges,
        paidAmount: depositPaid,
        balanceDue,
        currency: 'USD',
      },
      policies: {
        checkInPolicy: 'Government-issued photo identification and security deposit card required at check-in.',
        cancellationPolicy: 'Free cancellation up to 24 hours prior to standard check-in time.',
      },
    };
  }

  /**
   * Generates a USALI-compliant Tax Invoice metadata breakdown.
   */
  async generateTaxInvoice(
    bookingId: string,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        property: true,
        bookingItems: {
          include: { roomType: true },
        },
        folios: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Reservation with ID '${bookingId}' not found`);
    }

    if (!this.canAccessBooking(booking.tenantId, organizationId, caller)) {
      throw new ForbiddenException('Cross-tenant data access denied');
    }

    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

    const totalAmount = Number(booking.totalAmount);
    // Standard hospitality USALI tax breakdown:
    // Base Room Subtotal + 5% Lodging Tax + 2% Tourism Municipal Levy
    const taxRate = 0.07;
    const subtotal = Math.round((totalAmount / (1 + taxRate)) * 100) / 100;
    const lodgingTax = Math.round(subtotal * 0.05 * 100) / 100;
    const tourismLevy = Math.round((totalAmount - subtotal - lodgingTax) * 100) / 100;
    const paidAmount = Number(booking.depositAmount) || totalAmount;
    const balanceDue = Math.max(0, totalAmount - paidAmount);

    const primaryItem = booking.bookingItems[0];
    const roomTitle = primaryItem?.roomType?.title || 'Deluxe Room';
    const nightlyRate = Math.round((subtotal / nights) * 100) / 100;

    return {
      invoiceNumber: `INV-${booking.bookingCode}`,
      bookingCode: booking.bookingCode,
      status: balanceDue === 0 ? 'paid' : 'pending_balance',
      issueDate: booking.createdAt.toISOString().split('T')[0],
      dueDate: booking.checkInDate.toISOString().split('T')[0],
      seller: {
        name: booking.property.name,
        taxId: `TAX-US-${booking.propertyId.substring(0, 8).toUpperCase()}`,
        address: booking.property.address || 'OmniStay Destination Resort',
      },
      buyer: {
        name: booking.guest?.name || 'Valued Guest',
        email: booking.guest?.email || '',
      },
      lineItems: [
        {
          description: `Lodging Accommodation: ${roomTitle} (${nights} nights @ $${nightlyRate}/night)`,
          quantity: nights,
          unitPrice: nightlyRate,
          amount: subtotal,
          accountCode: '4010', // USALI Room Revenue
        },
      ],
      taxBreakdown: [
        {
          taxName: 'State Lodging & Occupancy Tax (5%)',
          rate: 0.05,
          amount: lodgingTax,
          accountCode: '2250', // Tax Payable
        },
        {
          taxName: 'City Tourism Development Levy (2%)',
          rate: 0.02,
          amount: tourismLevy,
          accountCode: '2250',
        },
      ],
      subtotal,
      taxTotal: Math.round((lodgingTax + tourismLevy) * 100) / 100,
      totalAmount,
      totalPaid: paidAmount,
      balanceDue,
      currency: 'USD',
    };
  }

  /**
   * Processes reservation cancellation with dynamic 3-tier refund policy evaluation:
   * - Tier 'flexible':
   *     - > 24 hours prior to check-in: 100% refund, 0% penalty
   *     - <= 24 hours: 0% refund, 100% penalty
   * - Tier 'moderate':
   *     - > 5 days prior to check-in: 100% refund, 0% penalty
   *     - 1 to 5 days prior to check-in: 50% refund, 50% penalty
   *     - <= 24 hours: 0% refund, 100% penalty
   * - Tier 'strict':
   *     - > 7 days prior to check-in: 50% refund, 50% penalty
   *     - <= 7 days: 0% refund, 100% penalty
   */
  async processCancellationWithRefund(
    bookingId: string,
    dto: CancelWithRefundDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        property: true,
        folios: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Reservation with ID '${bookingId}' not found`);
    }

    if (!this.canAccessBooking(booking.tenantId, organizationId, caller)) {
      throw new ForbiddenException('Cross-tenant data access denied');
    }

    if (booking.bookingStatus === 'cancelled') {
      throw new BadRequestException('This reservation is already cancelled');
    }

    if (booking.bookingStatus === 'checked_out') {
      throw new BadRequestException('Cannot cancel a completed/checked-out reservation');
    }

    const tier = dto.policyTier || 'flexible';
    const now = new Date();
    const checkIn = new Date(booking.checkInDate);
    const diffHours = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    let refundPercent = 0;

    if (tier === 'flexible') {
      refundPercent = diffHours >= 24 ? 100 : 0;
    } else if (tier === 'moderate') {
      if (diffDays >= 5) {
        refundPercent = 100;
      } else if (diffHours >= 24) {
        refundPercent = 50;
      } else {
        refundPercent = 0;
      }
    } else if (tier === 'strict') {
      if (diffDays >= 7) {
        refundPercent = 50;
      } else {
        refundPercent = 0;
      }
    }

    const totalPaid = Number(booking.depositAmount) || Number(booking.totalAmount);
    const refundAmount = Math.round(totalPaid * (refundPercent / 100) * 100) / 100;
    const penaltyFee = Math.round((totalPaid - refundAmount) * 100) / 100;

    // Update reservation record in database
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingStatus: 'cancelled',
      },
    });

    // Close any associated open guest folio
    if (booking.folios && booking.folios.length > 0) {
      await this.prisma.guestFolio.updateMany({
        where: { bookingId },
        data: { status: 'closed' },
      });
    }

    this.logger.log(
      `Booking ${booking.bookingCode} cancelled with ${tier} policy: ${refundPercent}% refund ($${refundAmount}), penalty $${penaltyFee}`,
    );

    return {
      message: `Reservation #${booking.bookingCode} successfully cancelled.`,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      status: 'cancelled',
      policyTier: tier,
      hoursBeforeCheckIn: Math.max(0, Math.round(diffHours * 10) / 10),
      financialSettlement: {
        totalPaid,
        refundPercentage: `${refundPercent}%`,
        refundAmount,
        penaltyFee,
        refundStatus: refundAmount > 0 ? 'approved_for_payout' : 'no_refund_applicable',
        currency: 'USD',
      },
    };
  }
}

