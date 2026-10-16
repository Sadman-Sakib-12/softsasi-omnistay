import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RedisService } from './redis.service.js';

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(() => {
    service = new RedisService();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should initialize and provide connection options compatible with BullMQ', () => {
    const options = service.getConnectionOptions();
    expect(options.host).toBeDefined();
    expect(options.port).toBeDefined();
    expect(options.maxRetriesPerRequest).toBeNull(); // Mandated by BullMQ
  });

  it('should report false for isReady when not connected to a live server', () => {
    expect(service.isReady()).toBe(false);
  });

  it('should safely return null on get when disconnected', async () => {
    const result = await service.get('nonexistent-key');
    expect(result).toBeNull();
  });

  it('should safely return null on set when disconnected', async () => {
    const result = await service.set('key', 'value');
    expect(result).toBeNull();
  });

  it('should safely return 0 on del when disconnected', async () => {
    const count = await service.del('key');
    expect(count).toBe(0);
  });

  it('should throw error when ping is called on disconnected service', async () => {
    await expect(service.ping()).rejects.toThrow('Redis is not connected');
  });
});
