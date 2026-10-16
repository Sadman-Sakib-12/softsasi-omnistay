import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller.js';
import { HealthService } from './services/health.service.js';
import { PrismaModule } from '@omnistay/database';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule { }
