import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from '../services/health.service.js';
import { Public } from '@omnistay/backend-common';

@ApiTags('System & Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'System health probe',
    description: 'Basic health check returning system uptime and timestamp.',
  })
  @ApiResponse({ status: 200, description: 'Service is operational' })
  checkHealth() {
    return this.healthService.getLiveness();
  }

  @Public()
  @Get('live')
  @ApiOperation({
    summary: 'Kubernetes liveness probe',
    description: 'Returns UP if application process is actively running.',
  })
  @ApiResponse({ status: 200, description: 'Process is alive' })
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Public()
  @Get('ready')
  @ApiOperation({
    summary: 'Kubernetes readiness probe',
    description: 'Verifies database and redis connection readiness.',
  })
  @ApiResponse({ status: 200, description: 'All backing services connected' })
  @ApiResponse({ status: 503, description: 'Backing service unavailable' })
  async getReadiness() {
    return this.healthService.getReadiness();
  }
}
