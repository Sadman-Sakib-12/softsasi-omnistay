import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { RedisService } from '../../../infrastructure/redis/redis.service.js';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Liveness probe: reports if the application process is running.
   */
  getLiveness() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      status: 'UP',
      uptime: `${uptimeSeconds}s`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness probe: verifies that PostgreSQL and Redis connections are operational.
   */
  async getReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1 as ping`;
    } catch (err: any) {
      this.logger.error(`Database readiness check failed: ${err.message}`);
      throw new ServiceUnavailableException('Database connection is unavailable');
    }

    const isRedisReady = this.redisService.isReady();

    return {
      status: 'UP',
      database: 'connected',
      redis: isRedisReady ? 'connected' : 'unavailable',
      timestamp: new Date().toISOString(),
    };
  }
}
