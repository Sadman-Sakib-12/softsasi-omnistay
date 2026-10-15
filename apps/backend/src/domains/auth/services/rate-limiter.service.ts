import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimiterService {
  private readonly attempts = new Map<string, RateLimitRecord>();

  /**
   * Enforces a rate limit for a specific action key.
   * @param key Unique identifier (e.g. `login:${ip}:${email}` or `otp:${ip}`)
   * @param maxAttempts Max allowed attempts within the window (default: 5)
   * @param windowMs Time window in milliseconds (default: 60,000 ms / 1 min)
   */
  consume(key: string, maxAttempts = 5, windowMs = 60000): void {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + windowMs });
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
   * Resets rate limit record upon successful authentication.
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
}
