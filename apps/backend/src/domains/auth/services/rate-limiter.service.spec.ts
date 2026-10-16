import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service.js';

describe('RateLimiterService', () => {
  let service: RateLimiterService;
  let mockRedis: any;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    mockRedis = {
      isReady: vi.fn().mockReturnValue(false),
      eval: vi.fn(),
      del: vi.fn().mockResolvedValue(1),
    };
    service = new RateLimiterService(mockRedis);
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('Non-Production In-Memory Fallback', () => {
    it('should allow requests under the limit in memory', async () => {
      for (let i = 0; i < 5; i++) {
        await service.consume('test-key', 5, 60000);
      }
    });

    it('should throw TOO_MANY_REQUESTS when in-memory limit is exceeded', async () => {
      for (let i = 0; i < 3; i++) {
        await service.consume('test-limit-key', 3, 60000);
      }

      await expect(service.consume('test-limit-key', 3, 60000)).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.TOO_MANY_REQUESTS,
        }),
      );
    });

    it('should reset attempt counter when reset is called', async () => {
      for (let i = 0; i < 3; i++) {
        await service.consume('reset-key', 3, 60000);
      }

      await service.reset('reset-key');
      await service.consume('reset-key', 3, 60000);
    });
  });

  describe('Production Fail-Closed Policy', () => {
    it('should FAIL CLOSED with 503 Service Unavailable when Redis is disconnected in production', async () => {
      process.env.NODE_ENV = 'production';
      mockRedis.isReady.mockReturnValue(false);

      await expect(service.consume('prod-key', 5, 60000)).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.SERVICE_UNAVAILABLE,
        }),
      );
    });
  });

  describe('Redis Distributed Sliding-Window', () => {
    it('should allow requests when Redis permits', async () => {
      mockRedis.isReady.mockReturnValue(true);
      mockRedis.eval.mockResolvedValue(1); // 1 = allowed

      await expect(service.consume('redis-key', 5, 60000)).resolves.not.toThrow();
      expect(mockRedis.eval).toHaveBeenCalled();
    });

    it('should throw 429 when Redis reports limit exceeded', async () => {
      mockRedis.isReady.mockReturnValue(true);
      mockRedis.eval.mockResolvedValue(0); // 0 = denied

      await expect(service.consume('redis-key', 5, 60000)).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.TOO_MANY_REQUESTS,
        }),
      );
    });

    it('should delete Redis key when reset is called', async () => {
      mockRedis.isReady.mockReturnValue(true);
      await service.reset('redis-reset-key');
      expect(mockRedis.del).toHaveBeenCalledWith('ratelimit:redis-reset-key');
    });
  });
});
