import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import crypto from 'node:crypto';
import { CookieConsentDto } from '../../presentation/dto/saas-plan.dto.js';

@Injectable()
export class ComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Chapter 19.5: Consent Cookie Management (CookieController / GDPR ePrivacy Directive)
   */
  async recordCookieConsent(ip: string, dto: CookieConsentDto) {
    const visitorIp = ip || '127.0.0.1';
    return this.prisma.cookieConsent.create({
      data: {
        visitorIp,
        userAgent: dto.userAgent || 'Unknown Browser',
        consentTypes: dto.consentTypes || ['necessary'],
      },
    });
  }

  async getCookieConsent(ip: string) {
    const visitorIp = ip || '127.0.0.1';
    const record = await this.prisma.cookieConsent.findFirst({
      where: { visitorIp },
      orderBy: { consentedAt: 'desc' },
    });
    return record || {
      visitorIp,
      consentTypes: ['necessary'],
      consentedAt: new Date(),
      isDefault: true,
    };
  }

  /**
   * Chapter 19.5: GDPR Right-to-be-Forgotten (Automated Data Anonymization - GDPR Article 17)
   */
  async anonymizeUserData(userId: string, requestedBy?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    if (user.isSuperadmin) {
      throw new BadRequestException('Platform SuperAdmin accounts cannot be anonymized for security governance.');
    }

    const anonymizedHash = crypto.createHash('sha256').update(`${userId}-${Date.now()}`).digest('hex').slice(0, 10);
    const anonymizedEmail = `anonymized-${anonymizedHash}@gdpr.omnistay.com`;

    return this.prisma.$transaction(async (tx) => {
      // 1. Anonymize user personal identifiability
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          name: `GDPR Anonymized User #${anonymizedHash.toUpperCase()}`,
          email: anonymizedEmail,
          phone: null,
          avatar: null,
          twoFactorSecret: null,
          isTwoFactorEnabled: false,
          twoFactorRecoveryCodes: [],
          status: 'ANONYMIZED',
        },
      });

      // 2. Clear user verifications documents (passports, IDs)
      await tx.userVerification.updateMany({
        where: { userId },
        data: {
          documentUrl: 'https://cdn.omnistay.com/redacted-gdpr.png',
          status: 'ANONYMIZED_PURGED',
        },
      });

      // 3. Record audit log entry
      if (user.tenantId) {
        await tx.activityLog.create({
          data: {
            tenantId: user.tenantId,
            userId: requestedBy || userId,
            action: 'GDPR_RIGHT_TO_BE_FORGOTTEN_EXECUTED',
            entityType: 'User',
            entityId: userId,
            details: {
              previousEmailHash: anonymizedHash,
              complianceStandard: 'GDPR Article 17 / CCPA',
              anonymizedAt: new Date().toISOString(),
            },
          },
        });
      }

      return {
        success: true,
        userId: updatedUser.id,
        anonymizedEmail: updatedUser.email,
        status: updatedUser.status,
        message: 'Personal identifiable data (PII) successfully purged and anonymized per GDPR Article 17.',
      };
    });
  }

  /**
   * Chapter 19.5: GDPR Data Portability Export (GDPR Article 20)
   */
  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        bookings: {
          select: {
            id: true,
            orderNumber: true,
            checkIn: true,
            checkOut: true,
            totalPrice: true,
            status: true,
            createdAt: true,
          },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
        userVerifications: {
          select: {
            id: true,
            idType: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    return {
      exportMetadata: {
        exportVersion: '1.0',
        standard: 'GDPR Article 20 / CCPA Data Portability Standard',
        exportedAt: new Date().toISOString(),
        requestUserId: userId,
      },
      personalData: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        twoFactorActive: user.isTwoFactorEnabled,
        registeredAt: user.createdAt,
      },
      hospitalityActivity: {
        totalReservationsRecorded: user.bookings.length,
        bookings: user.bookings,
        invoices: user.invoices,
      },
      verificationRecords: user.userVerifications,
    };
  }
}
