import { describe, it, expect, beforeEach } from 'vitest';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service.js';

describe('RateLimiterService', () => {
  let service: RateLimiterService;

  beforeEach(() => {
    service = new RateLimiterService();
  });

  it('should allow requests under the limit', () => {
    expect(() => {
      for (let i = 0; i < 5; i++) {
        service.consume('test-key', 5, 60000);
      }
    }).not.toThrow();
  });

  it('should throw TOO_MANY_REQUESTS when limit is exceeded', () => {
    for (let i = 0; i < 3; i++) {
      service.consume('test-limit-key', 3, 60000);
    }

    try {
      service.consume('test-limit-key', 3, 60000);
      expect.fail('Should have thrown TOO_MANY_REQUESTS');
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });

  it('should reset attempt counter when reset is called', () => {
    for (let i = 0; i < 3; i++) {
      service.consume('reset-key', 3, 60000);
    }

    service.reset('reset-key');

    expect(() => {
      service.consume('reset-key', 3, 60000);
    }).not.toThrow();
  });
});
