import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  let service: HealthService;
  let mockPrisma: any;
  let mockRedis: any;

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: vi.fn(),
    };
    mockRedis = {
      isReady: vi.fn().mockReturnValue(true),
    };
    service = new HealthService(mockPrisma, mockRedis);
  });

  it('should return liveness status UP with uptime', () => {
    const liveness = service.getLiveness();
    expect(liveness.status).toBe('UP');
    expect(liveness.uptime).toBeDefined();
    expect(liveness.timestamp).toBeDefined();
  });

  it('should return readiness UP when database and redis respond', async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([{ ping: 1 }]);

    const readiness = await service.getReadiness();
    expect(readiness.status).toBe('UP');
    expect(readiness.database).toBe('connected');
    expect(readiness.redis).toBe('connected');
    expect(readiness.timestamp).toBeDefined();
  });

  it('should report redis as unavailable when redis is disconnected', async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([{ ping: 1 }]);
    mockRedis.isReady.mockReturnValueOnce(false);

    const readiness = await service.getReadiness();
    expect(readiness.status).toBe('UP');
    expect(readiness.database).toBe('connected');
    expect(readiness.redis).toBe('unavailable');
  });

  it('should throw ServiceUnavailableException when database fails', async () => {
    mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('Connection lost'));

    await expect(service.getReadiness()).rejects.toThrow(ServiceUnavailableException);
  });
});
