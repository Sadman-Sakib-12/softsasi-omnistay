import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateWebhookDto, TestWebhookDto } from '../../presentation/dto/webhook.dto.js';
import {
  generateHmacSignature,
  verifyHmacSignature,
} from '../../../communication/domain/rules/webhook-signature.rule.js';
import crypto from 'node:crypto';

export const EXPONENTIAL_BACKOFF_SECONDS = [60, 300, 900, 3600, 21600]; // 1m, 5m, 15m, 1h, 6h
export const MAX_RETRY_ATTEMPTS = 5;

export interface WebhookDispatchResult {
  webhookId: string;
  url: string;
  deliveryId: string;
  status: 'success' | 'failed';
  responseStatus?: number;
  error?: string;
}

@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger(WebhookDispatcherService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registers a new outbound webhook subscriber for a tenant.
   */
  async createWebhook(tenantId: string, dto: CreateWebhookDto) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required to register a webhook');
    }

    const secretKey = dto.secretKey?.trim() || `whsec_${crypto.randomBytes(24).toString('hex')}`;

    const webhook = await this.prisma.webhook.create({
      data: {
        tenantId,
        url: dto.url.trim(),
        eventTypes: dto.eventTypes,
        secretHash: secretKey,
        isActive: dto.isActive ?? true,
      },
    });

    return {
      message: 'Webhook subscription successfully created',
      webhook: {
        id: webhook.id,
        tenantId: webhook.tenantId,
        url: webhook.url,
        eventTypes: webhook.eventTypes,
        secretKey,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
      },
    };
  }

  /**
   * Lists all registered webhooks for a tenant.
   */
  async listWebhooks(tenantId: string) {
    return this.prisma.webhook.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      include: {
        deliveries: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            eventType: true,
            responseStatus: true,
            status: true,
            attempts: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Retrieves single webhook by ID.
   */
  async getWebhookById(tenantId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      include: {
        deliveries: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!webhook) {
      throw new NotFoundException(`Webhook with ID '${id}' not found`);
    }

    return webhook;
  }

  /**
   * Soft deletes a webhook.
   */
  async deleteWebhook(tenantId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!webhook) {
      throw new NotFoundException(`Webhook with ID '${id}' not found`);
    }

    await this.prisma.webhook.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Webhook subscription deleted successfully', id };
  }

  /**
   * Retrieves delivery history logs for audit and diagnostics.
   */
  async getDeliveries(tenantId: string, webhookId?: string) {
    return this.prisma.webhookDelivery.findMany({
      where: {
        tenantId,
        ...(webhookId ? { webhookId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Dispatches an event payload to all subscribed webhooks for the tenant.
   * Signs body with HMAC-SHA256 and records delivery audit trace.
   */
  async dispatch(
    tenantId: string,
    eventType: string,
    payload: Record<string, any>,
  ): Promise<WebhookDispatchResult[]> {
    this.logger.log(`Dispatching event '${eventType}' for tenant '${tenantId}'`);

    const webhooks = await this.prisma.webhook.findMany({
      where: {
        tenantId,
        isActive: true,
        deletedAt: null,
      },
    });

    const matchedWebhooks = webhooks.filter((wh) => {
      const types = Array.isArray(wh.eventTypes) ? (wh.eventTypes as string[]) : [];
      return types.includes('*') || types.includes(eventType);
    });

    if (matchedWebhooks.length === 0) {
      this.logger.debug(`No active webhook subscribers for event '${eventType}' in tenant ${tenantId}`);
      return [];
    }

    const results: WebhookDispatchResult[] = [];

    for (const wh of matchedWebhooks) {
      const result = await this.sendDelivery(wh, eventType, payload);
      results.push(result);
    }

    return results;
  }

  /**
   * Dispatches a single test event ping to a specific webhook endpoint.
   */
  async testWebhook(tenantId: string, webhookId: string, dto?: TestWebhookDto): Promise<WebhookDispatchResult> {
    const webhook = await this.getWebhookById(tenantId, webhookId);

    const testEvent = dto?.eventType || 'booking.created';
    const testPayload = dto?.customPayload || {
      event: testEvent,
      timestamp: new Date().toISOString(),
      tenantId,
      mockData: {
        bookingCode: 'TST-BOOK-999',
        guestName: 'Sakib Test Guest',
        totalAmount: 350.0,
        status: 'confirmed',
        currency: 'USD',
      },
      note: 'Softsasi OmniStay 360 Webhook Ping Test Verification',
    };

    return this.sendDelivery(webhook, testEvent, testPayload);
  }

  /**
   * Executes HTTP delivery with HMAC-SHA256 signature and records delivery log.
   */
  private async sendDelivery(
    webhook: { id: string; tenantId: string; url: string; secretHash: string },
    eventType: string,
    payload: Record<string, any>,
  ): Promise<WebhookDispatchResult> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const serializedPayload = JSON.stringify({
      id: crypto.randomUUID(),
      event: eventType,
      createdAt: new Date().toISOString(),
      tenantId: webhook.tenantId,
      data: payload,
    });

    const signature = generateHmacSignature(`${timestamp}.${serializedPayload}`, webhook.secretHash);

    // Create delivery record in database
    const delivery = await this.prisma.webhookDelivery.create({
      data: {
        tenantId: webhook.tenantId,
        webhookId: webhook.id,
        eventType,
        payload: JSON.parse(serializedPayload),
        status: 'pending',
        attempts: 1,
      },
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Softsasi-Signature': `t=${timestamp},v1=${signature}`,
          'X-Softsasi-Event': eventType,
          'X-Softsasi-Delivery': delivery.id,
          'User-Agent': 'Softsasi-OmniStay-Webhook/1.0',
        },
        body: serializedPayload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text().catch(() => '');
      const isSuccess = response.status >= 200 && response.status < 300;

      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: isSuccess ? 'success' : 'failed',
          responseStatus: response.status,
          responseBody: responseText.slice(0, 1000), // cap to 1000 chars
        },
      });

      return {
        webhookId: webhook.id,
        url: webhook.url,
        deliveryId: delivery.id,
        status: isSuccess ? 'success' : 'failed',
        responseStatus: response.status,
      };
    } catch (err: any) {
      this.logger.warn(`Webhook delivery failed for ${webhook.url}: ${err.message}`);

      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'failed',
          responseStatus: 0,
          responseBody: err.message || 'Network / connection failure',
        },
      });

      return {
        webhookId: webhook.id,
        url: webhook.url,
        deliveryId: delivery.id,
        status: 'failed',
        responseStatus: 0,
        error: err.message,
      };
    }
  }

  /**
   * Re-attempts an existing failed delivery record with exponential backoff increment.
   */
  async retryDelivery(deliveryId: string): Promise<WebhookDispatchResult> {
    const delivery = await this.prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { webhook: true },
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery with ID '${deliveryId}' not found`);
    }

    if (!delivery.webhook || !delivery.webhook.isActive || delivery.webhook.deletedAt) {
      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'failed_permanent',
          responseBody: 'Target webhook subscriber is deactivated or deleted.',
        },
      });
      return {
        webhookId: delivery.webhookId,
        url: delivery.webhook?.url || '',
        deliveryId: delivery.id,
        status: 'failed',
        error: 'Target webhook subscriber is deactivated or deleted.',
      };
    }

    const nextAttempt = delivery.attempts + 1;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const serializedPayload = JSON.stringify(delivery.payload);
    const signature = generateHmacSignature(`${timestamp}.${serializedPayload}`, delivery.webhook.secretHash);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(delivery.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Softsasi-Signature': `t=${timestamp},v1=${signature}`,
          'X-Softsasi-Event': delivery.eventType,
          'X-Softsasi-Delivery': delivery.id,
          'X-Softsasi-Attempt': nextAttempt.toString(),
          'User-Agent': 'Softsasi-OmniStay-Webhook/1.0',
        },
        body: serializedPayload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text().catch(() => '');
      const isSuccess = response.status >= 200 && response.status < 300;
      const finalStatus = isSuccess
        ? 'success'
        : nextAttempt >= MAX_RETRY_ATTEMPTS
        ? 'failed_permanent'
        : 'failed';

      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          attempts: nextAttempt,
          status: finalStatus,
          responseStatus: response.status,
          responseBody: responseText.slice(0, 1000),
        },
      });

      if (!isSuccess && nextAttempt >= MAX_RETRY_ATTEMPTS) {
        this.logger.error(`Webhook delivery ${delivery.id} permanently failed after ${nextAttempt} attempts.`);
      }

      return {
        webhookId: delivery.webhook.id,
        url: delivery.webhook.url,
        deliveryId: delivery.id,
        status: isSuccess ? 'success' : 'failed',
        responseStatus: response.status,
      };
    } catch (err: any) {
      const finalStatus = nextAttempt >= MAX_RETRY_ATTEMPTS ? 'failed_permanent' : 'failed';

      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          attempts: nextAttempt,
          status: finalStatus,
          responseStatus: 0,
          responseBody: err.message || 'Network / connection failure during retry',
        },
      });

      if (nextAttempt >= MAX_RETRY_ATTEMPTS) {
        this.logger.error(
          `Webhook delivery ${delivery.id} permanently failed after ${nextAttempt} attempts: ${err.message}`,
        );
      }

      return {
        webhookId: delivery.webhook.id,
        url: delivery.webhook.url,
        deliveryId: delivery.id,
        status: 'failed',
        responseStatus: 0,
        error: err.message,
      };
    }
  }

  /**
   * Scans pending or failed webhook deliveries and executes automated exponential backoff retries (Chapter 20.2).
   * Retry schedule: 1m (60s), 5m (300s), 15m (900s), 1h (3600s), 6h (21600s).
   */
  async processPendingRetries(tenantId?: string, force = false, limit = 50) {
    const candidates = await this.prisma.webhookDelivery.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        status: 'failed',
        attempts: { lt: MAX_RETRY_ATTEMPTS },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        webhook: true,
      },
    });

    const now = Date.now();
    const eligibleDeliveries: typeof candidates = [];

    for (const item of candidates) {
      if (force) {
        eligibleDeliveries.push(item);
        continue;
      }

      const attemptIndex = Math.min(item.attempts - 1, EXPONENTIAL_BACKOFF_SECONDS.length - 1);
      const backoffRequiredSeconds = EXPONENTIAL_BACKOFF_SECONDS[attemptIndex];
      const elapsedSeconds = (now - new Date(item.createdAt).getTime()) / 1000;

      if (elapsedSeconds >= backoffRequiredSeconds) {
        eligibleDeliveries.push(item);
      }
    }

    const results = [];
    let succeeded = 0;
    let failed = 0;
    let permanentlyFailed = 0;

    for (const item of eligibleDeliveries) {
      const outcome = await this.retryDelivery(item.id);
      results.push(outcome);

      if (outcome.status === 'success') {
        succeeded++;
      } else {
        failed++;
        if (item.attempts + 1 >= MAX_RETRY_ATTEMPTS) {
          permanentlyFailed++;
        }
      }
    }

    return {
      totalCandidates: candidates.length,
      eligibleForRetry: eligibleDeliveries.length,
      processed: results.length,
      succeeded,
      failed,
      permanentlyFailed,
      backoffIntervalsSeconds: EXPONENTIAL_BACKOFF_SECONDS,
      maxAttempts: MAX_RETRY_ATTEMPTS,
      results,
    };
  }

  /**
   * Verifies an incoming webhook signature using HMAC-SHA256 and constant-time comparison.
   */
  verifyIncomingSignature(signatureHeader: string, rawPayload: string, secretKey: string): boolean {
    if (!signatureHeader || !rawPayload || !secretKey) return false;
    const parts = signatureHeader.split(',');
    const tPart = parts.find((p) => p.trim().startsWith('t='));
    const v1Part = parts.find((p) => p.trim().startsWith('v1='));

    if (!tPart || !v1Part) return false;
    const timestamp = tPart.trim().substring(2);
    const signature = v1Part.trim().substring(3);

    return verifyHmacSignature(`${timestamp}.${rawPayload}`, signature, secretKey);
  }

  /**
   * Returns complete event-driven webhook catalog with schemas, payload signatures, and security metadata (Chapter 20.2)
   */
  getEventsCatalog() {
    return {
      version: '2026-2027.v1',
      algorithm: 'HMAC-SHA256',
      signatureHeader: 'X-Softsasi-Signature: t={timestamp},v1={hmac_sha256}',
      backoffIntervals: [
        { attempt: 1, delaySeconds: 60, delayLabel: '1 minute' },
        { attempt: 2, delaySeconds: 300, delayLabel: '5 minutes' },
        { attempt: 3, delaySeconds: 900, delayLabel: '15 minutes' },
        { attempt: 4, delaySeconds: 3600, delayLabel: '1 hour' },
        { attempt: 5, delaySeconds: 21600, delayLabel: '6 hours' },
      ],
      maxRetryAttempts: MAX_RETRY_ATTEMPTS,
      permanentFailurePolicy: 'Status transitions to failed_permanent after 5 attempts and security alert is logged.',
      events: [
        {
          key: 'booking.created',
          domain: 'Hospitality / Bookings',
          description: 'Triggered when a guest, OTA channel, or receptionist places a confirmed room reservation.',
          samplePayload: {
            bookingId: 'f56860db-bcf5-4cf5-99d8-9990b793dc01',
            bookingReference: 'BK-2026-8891',
            guestName: 'Arthur Vance',
            roomType: 'Royal Sunset Sky Penthouse',
            roomNumber: '801',
            checkInDate: '2026-11-15',
            checkOutDate: '2026-11-20',
            totalAmount: 4200.0,
            currency: 'USD',
            status: 'CONFIRMED',
          },
        },
        {
          key: 'booking.checked_in',
          domain: 'Hospitality / Front Desk',
          description: 'Triggered upon successful arrival, passport OCR verification, or BLE/RFID digital key issuance.',
          samplePayload: {
            bookingId: 'f56860db-bcf5-4cf5-99d8-9990b793dc01',
            roomNumber: '801',
            guestName: 'Arthur Vance',
            checkInTimestamp: '2026-11-15T14:30:00Z',
            keyType: 'BLE_DIGITAL_KEY',
            assignedBy: 'Receptionist David',
          },
        },
        {
          key: 'booking.cancelled',
          domain: 'Hospitality / Cancellations',
          description: 'Triggered when a reservation is voided or cancelled by guest or administrative operator.',
          samplePayload: {
            bookingId: 'f56860db-bcf5-4cf5-99d8-9990b793dc01',
            bookingReference: 'BK-2026-8891',
            guestName: 'Arthur Vance',
            reason: 'Guest flight schedule change',
            cancellationFee: 0.0,
            refundInitiated: true,
            cancelledAt: '2026-11-10T09:15:00Z',
          },
        },
        {
          key: 'room.status_changed',
          domain: 'Housekeeping & Maintenance',
          description: 'Triggered when room cleanliness or maintenance state changes (Dirty, Clean, Inspected, Out of Order).',
          samplePayload: {
            propertyId: 'cb57c2f2-3810-4a0e-8af0-78ad02d69971',
            roomNumber: '214',
            oldStatus: 'DIRTY',
            newStatus: 'INSPECTED',
            housekeeperName: 'Fatima Begum',
            updatedAt: '2026-11-07T11:20:00Z',
          },
        },
        {
          key: 'pos.order_completed',
          domain: 'Point of Sale (POS)',
          description: 'Triggered when dining, beverage, banquet, or spa order is settled or charged directly to room folio.',
          samplePayload: {
            orderId: '77d29481-863a-4ef1-a477-99bb904f4402',
            orderNumber: 'POS-2026-4402',
            terminalName: 'Sky Lounge Restaurant',
            roomNumber: '801',
            totalAmount: 185.5,
            settlementType: 'CHARGE_TO_ROOM',
            completedAt: '2026-11-07T12:45:00Z',
          },
        },
        {
          key: 'stock.low_threshold',
          domain: 'Warehouse & Inventory',
          description: 'Triggered when inventory stock drops below minimum safety threshold.',
          samplePayload: {
            itemId: '8cb9f193-e022-4418-bd81-3094857bf641',
            sku: 'LINEN-BATH-TWL-01',
            itemName: 'Egyptian Cotton Luxury Bath Towel',
            warehouse: 'Central Warehouse B',
            currentQuantity: 12,
            minThreshold: 25,
            alertLevel: 'CRITICAL',
          },
        },
        {
          key: 'payroll.approved',
          domain: 'HRM & Payroll',
          description: 'Triggered when departmental payroll batch is audited, approved, and released for disbursement.',
          samplePayload: {
            batchId: 'c192d837-f823-41bb-98da-901a88bb3310',
            periodMonth: '2026-10',
            department: 'All Departments',
            totalEmployees: 48,
            totalGrossPay: 142500.0,
            approvedBy: 'Financial Controller',
            approvedAt: '2026-11-01T17:00:00Z',
          },
        },
      ],
    };
  }
}


