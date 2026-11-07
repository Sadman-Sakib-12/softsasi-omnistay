import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@omnistay/backend-common';
import { DeveloperRoadmapService } from '../../application/services/developer-roadmap.service.js';

@ApiTags('Developer Roadmap & 64-Week Sprint Plan (Chapter 21)')
@Controller(['api/v1/developer', 'api/v1/projects/roadmap'])
export class DeveloperRoadmapController {
  constructor(private readonly roadmapService: DeveloperRoadmapService) {}

  @Public()
  @Get(['roadmap', 'phases', ''])
  @ApiOperation({
    summary: 'Get 10-Phase 64-Week Master Development Roadmap (Chapter 21.1)',
    description: 'Returns sequential milestones, timeline in weeks/months, deliverables, exit gates, and sprint breakdown across all 10 engineering phases.',
  })
  @ApiResponse({ status: 200, description: '10-Phase master development roadmap' })
  getMasterRoadmap() {
    return this.roadmapService.getMasterRoadmap();
  }

  @Public()
  @Get('dod-checklist')
  @ApiOperation({
    summary: 'Get Developer Definition of Done (DoD) Checklist Verification (Chapter 21.4)',
    description: 'Returns verification status for all 5 mandatory production DoD gates: Code Quality, Multi-Tenancy & Security, Accounting Audits, Testing Coverage >= 85%, and OpenAPI 3.1 Documentation.',
  })
  @ApiResponse({ status: 200, description: 'Definition of Done checklist status' })
  getDodChecklist() {
    return this.roadmapService.getDodChecklist();
  }

  @Public()
  @Get('qa-metrics')
  @ApiOperation({
    summary: 'Get Quality Assurance & Automated Testing Architecture metrics (Chapter 21.2)',
    description: 'Returns status for Vitest unit tests (>=85% coverage), Playwright E2E headless tests, and k6 concurrency load tests (100k travelers, 1k POS txs).',
  })
  @ApiResponse({ status: 200, description: 'QA and test automation metrics' })
  getQaTestingMetrics() {
    return this.roadmapService.getQaTestingMetrics();
  }

  @Public()
  @Get('cicd')
  @ApiOperation({
    summary: 'Get CI/CD Deployment Architecture & DevOps specifications (Chapter 21.3)',
    description: 'Returns specifications for automated GitHub PR validation, Kubernetes blue-green rolling zero-downtime deployments, and PostgreSQL WAL PITR backups.',
  })
  @ApiResponse({ status: 200, description: 'CI/CD and DevOps specifications' })
  getCiCdArchitecture() {
    return this.roadmapService.getCiCdArchitecture();
  }
}

