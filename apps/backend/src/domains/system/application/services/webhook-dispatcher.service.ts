import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateWebhookDto, TestWebhookDto } from '../../presentation/dto/webhook.dto.js';
import { generateHmacSignature } from '../../../communication/domain/rules/webhook-signature.rule.js';
import crypto from 'node:crypto';

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
}

