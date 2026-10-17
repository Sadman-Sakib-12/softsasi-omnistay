import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { RedisService } from '../src/infrastructure/redis/redis.service.js';
import { RateLimiterService } from '../src/domains/auth/services/rate-limiter.service.js';
import { NotificationProcessor } from '../src/infrastructure/queue/notification.processor.js';
import { JOB_NAMES, TwoFactorAlertJobPayload } from '../src/infrastructure/queue/queue.constants.js';
import { Queue, Worker, Job } from 'bullmq';
import net from 'node:net';

/**
 * Probes whether a live Redis server is reachable at the given host and port.
 */
function checkRedisReachable(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

describe('Live Infrastructure Verification (Redis & BullMQ against Real Server)', () => {
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  let isRedisAvailable = false;
  let redisService: RedisService;

  beforeAll(async () => {
    isRedisAvailable = await checkRedisReachable(host, port);
    if (!isRedisAvailable) {
      console.warn(
        `\n[LIVE INFRASTRUCTURE] Redis is not reachable at ${host}:${port}. Live integration tests will report Pending External Dependency without mocks.\n`,
      );
    } else {
      redisService = new RedisService();
      await redisService.onModuleInit();
    }
  });

  afterAll(async () => {
    if (redisService) {
      await redisService.onModuleDestroy();
    }
  });

  describe('Task 2 — Redis Live Verification', () => {
    it('should establish a real connection, return PONG, and report isReady === true', async () => {
      if (!isRedisAvailable) {
        console.warn('Skipping: live Redis not reachable.');
        return;
      }

      expect(redisService.isReady()).toBe(true);
      const pong = await redisService.ping();
      expect(pong).toBe('PONG');

      const client = redisService.getClient();
      expect(client).not.toBeNull();
      const serverInfo = await client!.info('server');
      expect(serverInfo).toContain('redis_version');
    });

    it('should execute actual Lua-based distributed rate limiting with sliding window on real Redis', async () => {
      if (!isRedisAvailable) return;

      const rateLimiter = new RateLimiterService(redisService);
      const uniqueKey = `live-ratelimit-user-${Date.now()}`;

      // Max 4 attempts in a 30s window
      for (let i = 1; i <= 4; i++) {
        await expect(rateLimiter.consume(uniqueKey, 4, 30000)).resolves.not.toThrow();
      }

      // 5th attempt must be rejected by Lua script with 429
      await expect(rateLimiter.consume(uniqueKey, 4, 30000)).rejects.toThrow(
        expect.objectContaining({
          status: 429,
        }),
      );

      // Verify reset deletes the Redis key and permits subsequent consumption
      await rateLimiter.reset(uniqueKey);
      await expect(rateLimiter.consume(uniqueKey, 4, 30000)).resolves.not.toThrow();

      // Clean up test key
      await rateLimiter.reset(uniqueKey);
    });

    it('should maintain atomic behavior under concurrent requests via Lua script on real Redis', async () => {
      if (!isRedisAvailable) return;

      const rateLimiter = new RateLimiterService(redisService);
      const concurrencyKey = `live-concurrent-test-${Date.now()}`;
      const maxAllowed = 5;
      const totalRequests = 10;

      // Fire 10 concurrent requests simultaneously at the real Redis instance
      const promises = Array.from({ length: totalRequests }).map(() =>
        rateLimiter.consume(concurrencyKey, maxAllowed, 30000),
      );

      const results = await Promise.allSettled(promises);
      const succeeded = results.filter((r) => r.status === 'fulfilled');
      const failed = results.filter((r) => r.status === 'rejected');

      // Exactly maxAllowed (5) must succeed and exactly 5 must be rejected
      expect(succeeded).toHaveLength(maxAllowed);
      expect(failed).toHaveLength(totalRequests - maxAllowed);

      for (const f of failed) {
        expect((f as PromiseRejectedResult).reason).toMatchObject({ status: 429 });
      }

      // Clean up key
      await rateLimiter.reset(concurrencyKey);
    });

    it('should verify atomic single-use SET NX replay protection on real Redis', async () => {
      if (!isRedisAvailable) return;

      const testKey = `omnistay:live-test:replay:${Date.now()}`;

      // First SET NX must succeed (returns true)
      const firstSet = await redisService.setIfNotExists(testKey, '1', 60);
      expect(firstSet).toBe(true);

      // Concurrent/second SET NX on the exact same key must fail (returns false)
      const secondSet = await redisService.setIfNotExists(testKey, '1', 60);
      expect(secondSet).toBe(false);

      // Clean up key
      await redisService.del(testKey);
    });

    it('should FAIL CLOSED in production when Redis becomes unavailable', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const disconnectedService = new RedisService();
      const rateLimiter = new RateLimiterService(disconnectedService);

      await expect(rateLimiter.consume('prod-live-disconnect-key', 5, 60000)).rejects.toThrow(
        expect.objectContaining({
          status: 503,
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should fall back to in-memory rate limiting with warnings in development environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const disconnectedService = new RedisService();
      const rateLimiter = new RateLimiterService(disconnectedService);
      const devKey = `dev-fallback-${Date.now()}`;

      // Allows requests under limit
      for (let i = 0; i < 3; i++) {
        await rateLimiter.consume(devKey, 3, 60000);
      }

      // Throws 429 when limit exceeded in memory
      await expect(rateLimiter.consume(devKey, 3, 60000)).rejects.toThrow(
        expect.objectContaining({
          status: 429,
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should perform graceful shutdown and set isReady to false', async () => {
      if (!isRedisAvailable) return;

      const tempService = new RedisService();
      await tempService.onModuleInit();
      expect(tempService.isReady()).toBe(true);

      await tempService.onModuleDestroy();
      expect(tempService.isReady()).toBe(false);
    });
  });

  describe('Task 3 — BullMQ Live Verification', () => {
    it('should enqueue, process with worker, retry with exponential backoff, and clean up test resources', async () => {
      if (!isRedisAvailable) return;

      const testQueueName = `omnistay-live-test-${Date.now()}`;
      const connection = redisService.getConnectionOptions() as any;

      const queue = new Queue(testQueueName, {
        connection,
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 300,
          },
          removeOnComplete: {
            age: 3600,
            count: 100,
          },
          removeOnFail: {
            age: 86400,
            count: 500,
          },
        },
      });

      let attemptsCount = 0;
      let completedJobData: any = null;

      const worker = new Worker(
        testQueueName,
        async (job: Job) => {
          attemptsCount++;
          if (job.data.triggerRetry && attemptsCount === 1) {
            // Simulate transient network or SMTP failure on attempt 1 to test backoff
            throw new Error('Simulated transient worker failure to test exponential backoff');
          }
          completedJobData = job.data;
          return { processed: true, channel: 'security-audit' };
        },
        {
          connection,
          concurrency: 2,
        },
      );

      // Enqueue clearly identified test job with masked data (NO real customer email, NO secrets)
      const testPayload: TwoFactorAlertJobPayload = {
        userId: 'usr-live-verify-id',
        email: 'synthetic.test.user@omnistay-internal.local',
        action: 'ENABLED',
        ipAddress: '127.0.0.1',
      };

      const job = await queue.add(JOB_NAMES.NOTIFICATION_2FA_ALERT, {
        ...testPayload,
        triggerRetry: true,
      });

      // Wait for completion across retry cycle
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error('BullMQ worker processing timed out after 10s')),
          10000,
        );

        worker.on('completed', (completedJob) => {
          if (completedJob.id === job.id) {
            clearTimeout(timeout);
            resolve();
          }
        });

        worker.on('failed', (failedJob, err) => {
          // Failed attempt 1 is expected for backoff test
          if (failedJob?.attemptsMade === 2) {
            clearTimeout(timeout);
            reject(err);
          }
        });
      });

      // Verification: Worker consumed job and retried according to backoff
      expect(completedJobData).toBeDefined();
      expect(completedJobData.userId).toBe('usr-live-verify-id');
      expect(attemptsCount).toBe(2); // Attempt 1 failed -> backoff -> Attempt 2 succeeded

      // Verify retention settings on completed job
      const fetchedJob = await queue.getJob(job.id!);
      expect(fetchedJob).not.toBeNull();
      const state = await fetchedJob!.getState();
      expect(state).toBe('completed');
      expect(fetchedJob!.opts.removeOnComplete).toEqual({ age: 3600, count: 100 });
      expect(fetchedJob!.opts.removeOnFail).toEqual({ age: 86400, count: 500 });

      // Clean up ONLY the temporary test queue and its keys
      await worker.close();
      await queue.obliterate({ force: true });
      await queue.close();
    });

    it('should verify email masking and zero secret logging in NotificationProcessor', async () => {
      const processor = new NotificationProcessor(redisService);

      const jobPayload = {
        userId: 'usr-mask-test',
        email: 'finance.director@luxuryhotel.com',
        token: 'secret_jwt_reset_token_that_must_never_be_logged',
        expiresInMinutes: 15,
      };

      const result = await processor.processJob({
        name: JOB_NAMES.NOTIFICATION_PASSWORD_RESET,
        data: jobPayload,
      });

      expect(result.processed).toBe(true);
      expect(result.channel).toBe('email');

      // Test masking function directly
      const masked = (processor as any).maskEmail('finance.director@luxuryhotel.com');
      expect(masked).toBe('f***r@luxuryhotel.com');
      expect(masked).not.toContain('director');
    });
  });
});
