import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

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
   * Readiness probe: verifies that PostgreSQL database connection is operational.
   */
  async getReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1 as ping`;
      return {
        status: 'UP',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      this.logger.error(`Database readiness check failed: ${err.message}`);
      throw new ServiceUnavailableException('Database connection is unavailable');
    }
  }
}
