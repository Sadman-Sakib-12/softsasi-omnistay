import { Module } from '@nestjs/common';
import { HealthController } from './presentation/controllers/health.controller.js';
import { HealthService } from './application/services/health.service.js';
import { PrismaModule } from '@omnistay/database';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
