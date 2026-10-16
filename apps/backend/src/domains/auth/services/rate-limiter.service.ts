import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RedisService } from '../../../infrastructure/redis/redis.service.js';

interface InMemoryRateLimitRecord {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly inMemoryAttempts = new Map<string, InMemoryRateLimitRecord>();

  constructor(private readonly redisService: RedisService) { }

  /**
   * Enforces a rate limit for an action key using an atomic sliding-window algorithm.
   * If Redis is active, uses Redis ZSET atomic Lua script to eliminate race conditions.
   * In production, if Redis is unavailable, it FAILS CLOSED (rejects request with 503 Service Unavailable).
   * In development/test mode, it falls back to an in-memory window with logged warnings.
   *
   * @param key Unique identifier (e.g. `login:${ip}:${email}` or `otp:${ip}`)
   * @param maxAttempts Max allowed attempts within the window (default: 5)
   * @param windowMs Time window in milliseconds (default: 60,000 ms / 1 min)
   */
  async consume(key: string, maxAttempts = 5, windowMs = 60000): Promise<void> {
    if (this.redisService.isReady()) {
      await this.consumeRedis(key, maxAttempts, windowMs);
    } else {
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        this.logger.error(
          `[FAIL-CLOSED] Redis rate limiter unavailable in production for key: ${key}. Denying access.`,
        );
        throw new HttpException(
          {
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'Authentication security service temporarily unavailable. Please retry shortly.',
            error: 'Service Unavailable',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // Non-production fallback with warning
      this.logger.warn(
        `[FALLBACK] Redis disconnected. Using in-memory rate limiter for key: ${key}`,
      );
      this.consumeInMemory(key, maxAttempts, windowMs);
    }
  }

  /**
   * Atomic sliding-window rate limit implementation in Redis via Lua.
   */
  private async consumeRedis(key: string, maxAttempts: number, windowMs: number): Promise<void> {
    const redisKey = `ratelimit:${key}`;
    const now = Date.now();
    const clearBefore = now - windowMs;

    const luaScript = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local clearBefore = tonumber(ARGV[2])
      local maxAttempts = tonumber(ARGV[3])
      local windowMs = tonumber(ARGV[4])

      -- Purge expired entries
      redis.call('ZREMRANGEBYSCORE', key, '-inf', clearBefore)

      -- Count valid attempts within the active sliding window
      local currentAttempts = redis.call('ZCARD', key)

      if currentAttempts >= maxAttempts then
        return 0
      else
        local member = tostring(now) .. ':' .. tostring(redis.call('INCR', 'ratelimit:counter'))
        redis.call('ZADD', key, now, member)
        redis.call('PEXPIRE', key, windowMs)
        return 1
      end
    `;

    try {
      const allowed = (await this.redisService.eval(
        luaScript,
        1,
        redisKey,
        now,
        clearBefore,
        maxAttempts,
        windowMs,
      )) as number;

      if (allowed === 0) {
        const waitSeconds = Math.ceil(windowMs / 1000);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Too many attempts. Please try again after ${waitSeconds} seconds.`,
            error: 'Too Many Requests',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`Redis rate limit check error: ${err.message}`);
      if (process.env.NODE_ENV === 'production') {
        throw new HttpException(
          'Security service temporarily unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      this.consumeInMemory(key, maxAttempts, windowMs);
    }
  }

  /**
   * Local in-memory rate limiting fallback for development/test environments.
   */
  private consumeInMemory(key: string, maxAttempts: number, windowMs: number): void {
    const now = Date.now();
    const record = this.inMemoryAttempts.get(key);

    if (!record || now > record.resetAt) {
      this.inMemoryAttempts.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }

    if (record.count >= maxAttempts) {
      const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many attempts. Please try again after ${waitSeconds} seconds.`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
  }

  /**
   * Resets rate limit records upon successful authentication.
   */
  async reset(key: string): Promise<void> {
    this.inMemoryAttempts.delete(key);
    if (this.redisService.isReady()) {
      try {
        await this.redisService.del(`ratelimit:${key}`);
      } catch (err: any) {
        this.logger.warn(`Could not reset Redis rate limit key ${key}: ${err.message}`);
      }
    }
  }
}
