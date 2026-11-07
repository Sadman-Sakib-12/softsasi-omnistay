import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  WebhookDispatcherService,
  EXPONENTIAL_BACKOFF_SECONDS,
  MAX_RETRY_ATTEMPTS,
} from './application/services/webhook-dispatcher.service.js';
import { generateHmacSignature, verifyHmacSignature } from '../communication/domain/rules/webhook-signature.rule.js';

describe('Chapter 20: Complete OpenAPI 3.1 & Event-Driven Webhook Catalog Specification', () => {
  let service: WebhookDispatcherService;
  let mockPrisma: any;

  const mockWebhooks: any[] = [];
  const mockDeliveries: any[] = [];

  beforeEach(() => {
    mockWebhooks.length = 0;
    mockDeliveries.length = 0;

    mockPrisma = {
      webhook: {
        create: vi.fn().mockImplementation(({ data }) => {
          const item = {
            id: `wh-${mockWebhooks.length + 1}`,
            createdAt: new Date(),
            deletedAt: null,
            ...data,
          };
          mockWebhooks.push(item);
          return Promise.resolve(item);
        }),
        findMany: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(
            mockWebhooks.filter(
              (w) =>
                (!where.tenantId || w.tenantId === where.tenantId) &&
                (where.isActive === undefined || w.isActive === where.isActive) &&
                (where.deletedAt === null ? w.deletedAt === null : true),
            ),
          );
        }),
        findFirst: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(
            mockWebhooks.find(
              (w) =>
                (!where.id || w.id === where.id) &&
                (!where.tenantId || w.tenantId === where.tenantId) &&
                (where.deletedAt === null ? w.deletedAt === null : true),
            ) || null,
          );
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const item = mockWebhooks.find((w) => w.id === where.id);
          if (item) {
            Object.assign(item, data);
            return Promise.resolve(item);
          }
          return Promise.resolve(null);
        }),
      },
      webhookDelivery: {
        create: vi.fn().mockImplementation(({ data }) => {
          const item = {
            id: `del-${mockDeliveries.length + 1}`,
            createdAt: new Date(),
            ...data,
          };
          mockDeliveries.push(item);
          return Promise.resolve(item);
        }),
        findMany: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(
            mockDeliveries.filter((d) => {
              if (where.tenantId && d.tenantId !== where.tenantId) return false;
              if (where.webhookId && d.webhookId !== where.webhookId) return false;
              if (where.status && d.status !== where.status) return false;
              if (where.attempts?.lt !== undefined && d.attempts >= where.attempts.lt) return false;
              return true;
            }),
          );
        }),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          const item = mockDeliveries.find((d) => d.id === where.id);
          if (!item) return Promise.resolve(null);
          const webhook = mockWebhooks.find((w) => w.id === item.webhookId);
          return Promise.resolve({ ...item, webhook });
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const item = mockDeliveries.find((d) => d.id === where.id);
          if (item) {
            Object.assign(item, data);
            return Promise.resolve(item);
          }
          return Promise.resolve(null);
        }),
      },
    };

    service = new WebhookDispatcherService(mockPrisma);
  });

  describe('20.2.1 Outbound Webhook Registration & Security', () => {
    it('creates webhook with generated HMAC-SHA256 secret key and tenant partition', async () => {
      const result = await service.createWebhook('tenant-alpha', {
        url: 'https://api.external-pms.com/webhooks/omnistay',
        eventTypes: ['booking.created', 'booking.cancelled'],
      });

      expect(result.message).toBe('Webhook subscription successfully created');
      expect(result.webhook.url).toBe('https://api.external-pms.com/webhooks/omnistay');
      expect(result.webhook.secretKey).toMatch(/^whsec_[a-f0-9]{48}$/);
      expect(mockWebhooks).toHaveLength(1);
    });

    it('verifies HMAC-SHA256 signature formatting and validates valid header signatures', () => {
      const payload = JSON.stringify({ event: 'booking.created', amount: 4200 });
      const secret = 'whsec_test_secret_key_123';
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = generateHmacSignature(`${timestamp}.${payload}`, secret);

      const header = `t=${timestamp},v1=${signature}`;
      const isValid = service.verifyIncomingSignature(header, payload, secret);
      expect(isValid).toBe(true);

      const isInvalid = service.verifyIncomingSignature(header, payload + 'tampered', secret);
      expect(isInvalid).toBe(false);
    });
  });

  describe('20.2.2 Event-Driven Webhook Catalog (7 Canonical Events)', () => {
    it('returns all 7 mandated event trigger keys with domains and sample payloads', () => {
      const catalog = service.getEventsCatalog();

      expect(catalog.version).toBe('2026-2027.v1');
      expect(catalog.algorithm).toBe('HMAC-SHA256');
      expect(catalog.maxRetryAttempts).toBe(MAX_RETRY_ATTEMPTS);
      expect(catalog.backoffIntervals).toHaveLength(5);

      const eventKeys = catalog.events.map((e) => e.key);
      expect(eventKeys).toContain('booking.created');
      expect(eventKeys).toContain('booking.checked_in');
      expect(eventKeys).toContain('booking.cancelled');
      expect(eventKeys).toContain('room.status_changed');
      expect(eventKeys).toContain('pos.order_completed');
      expect(eventKeys).toContain('stock.low_threshold');
      expect(eventKeys).toContain('payroll.approved');

      expect(catalog.events).toHaveLength(7);
    });
  });

  describe('20.2.3 Exponential Backoff Retries Schedule [60s, 300s, 900s, 3600s, 21600s]', () => {
    it('enforces exact retry backoff intervals and marks status as failed_permanent after 5 attempts', async () => {
      expect(EXPONENTIAL_BACKOFF_SECONDS).toEqual([60, 300, 900, 3600, 21600]);
      expect(MAX_RETRY_ATTEMPTS).toBe(5);

      // Create a webhook
      const wh = await service.createWebhook('tenant-alpha', {
        url: 'https://httpbin.org/status/500',
        eventTypes: ['booking.created'],
      });

      // Insert a failed delivery with attempt 4
      const initialDelivery = {
        id: 'del-retry-test',
        tenantId: 'tenant-alpha',
        webhookId: wh.webhook.id,
        eventType: 'booking.created',
        payload: { bookingId: 'bk-1' },
        status: 'failed',
        attempts: 4,
        createdAt: new Date(Date.now() - 3700 * 1000), // > 3600s elapsed
      };
      mockDeliveries.push(initialDelivery);

      // Mock fetch failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

      // Process retry
      const retryResult = await service.retryDelivery(initialDelivery.id);
      expect(retryResult.status).toBe('failed');

      // Now attempts should be 5 and status should transition to failed_permanent
      const updated = mockDeliveries.find((d) => d.id === initialDelivery.id);
      expect(updated.attempts).toBe(5);
      expect(updated.status).toBe('failed_permanent');
    });

    it('processes batch retries filtering by elapsed backoff window', async () => {
      const wh = await service.createWebhook('tenant-alpha', {
        url: 'https://httpbin.org/post',
        eventTypes: ['*'],
      });

      // Item 1: attempt 1, created 70 seconds ago (> 60s backoff required) -> ELIGIBLE
      mockDeliveries.push({
        id: 'del-eligible-1',
        tenantId: 'tenant-alpha',
        webhookId: wh.webhook.id,
        eventType: 'booking.created',
        payload: { bookingId: 'bk-100' },
        status: 'failed',
        attempts: 1,
        createdAt: new Date(Date.now() - 70 * 1000),
      });

      // Item 2: attempt 1, created 20 seconds ago (< 60s backoff required) -> NOT YET ELIGIBLE
      mockDeliveries.push({
        id: 'del-not-ready',
        tenantId: 'tenant-alpha',
        webhookId: wh.webhook.id,
        eventType: 'room.status_changed',
        payload: { room: '101' },
        status: 'failed',
        attempts: 1,
        createdAt: new Date(Date.now() - 20 * 1000),
      });

      // Mock successful response on retry
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        text: () => Promise.resolve('{"status":"ok"}'),
      });

      const batchSummary = await service.processPendingRetries('tenant-alpha', false);
      expect(batchSummary.totalCandidates).toBe(2);
      expect(batchSummary.eligibleForRetry).toBe(1);
      expect(batchSummary.processed).toBe(1);
      expect(batchSummary.succeeded).toBe(1);

      const delivered = mockDeliveries.find((d) => d.id === 'del-eligible-1');
      expect(delivered.status).toBe('success');
      expect(delivered.attempts).toBe(2);
    });
  });
});

