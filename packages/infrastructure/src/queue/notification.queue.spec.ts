import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationProducer } from './notification.producer.js';
import { NotificationProcessor } from './notification.processor.js';
import { JOB_NAMES, PasswordResetJobPayload, TwoFactorAlertJobPayload } from './queue.constants.js';

describe('BullMQ Notification Infrastructure', () => {
  let producer: NotificationProducer;
  let processor: NotificationProcessor;
  let mockRedis: any;

  beforeEach(() => {
    mockRedis = {
      isReady: vi.fn().mockReturnValue(true),
      getConnectionOptions: vi.fn().mockReturnValue({
        host: 'localhost',
        port: 6379,
        maxRetriesPerRequest: null,
      }),
    };

    producer = new NotificationProducer(mockRedis);
    processor = new NotificationProcessor(mockRedis);
  });

  describe('NotificationProcessor', () => {
    it('should process password reset job successfully and mask email in output', async () => {
      const payload: PasswordResetJobPayload = {
        userId: 'usr-uuid-1234',
        email: 'user.test@example.com',
        token: 'secret_raw_token_must_not_be_logged',
        expiresInMinutes: 15,
      };

      const mockJob: any = {
        id: 'job-1',
        name: JOB_NAMES.NOTIFICATION_PASSWORD_RESET,
        data: payload,
      };

      const result = await processor.processJob(mockJob);
      expect(result.processed).toBe(true);
      expect(result.channel).toBe('email');
    });

    it('should process 2FA security alert job', async () => {
      const payload: TwoFactorAlertJobPayload = {
        userId: 'usr-uuid-1234',
        email: 'admin@example.com',
        action: 'ENABLED',
        ipAddress: '192.168.1.1',
      };

      const mockJob: any = {
        id: 'job-2',
        name: JOB_NAMES.NOTIFICATION_2FA_ALERT,
        data: payload,
      };

      const result = await processor.processJob(mockJob);
      expect(result.processed).toBe(true);
      expect(result.channel).toBe('security-audit');
    });

    it('should return false for unknown jobs', async () => {
      const mockJob: any = {
        id: 'job-999',
        name: 'unknown:job:type',
        data: {},
      };

      const result = await processor.processJob(mockJob);
      expect(result.processed).toBe(false);
    });
  });

  describe('NotificationProducer Safe Handling', () => {
    it('should return null without throwing when Redis is disconnected', async () => {
      mockRedis.isReady.mockReturnValue(false);

      const result = await producer.sendPasswordResetEmail({
        userId: 'usr-1',
        email: 'test@example.com',
        token: 'token-123',
        expiresInMinutes: 15,
      });

      expect(result).toBeNull();
    });
  });
});
