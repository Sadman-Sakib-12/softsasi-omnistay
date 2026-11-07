import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Public } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { SaasBillingService } from '../../application/services/saas-billing.service.js';
import {
  CreatePlanRequestDto,
  CreateSaasPlanDto,
  SubscribePlanDto,
  ToggleFeatureFlagDto,
} from '../dto/saas-plan.dto.js';

@ApiTags('SaaS Subscription Billing & SuperAdmin Central Operations (Chapter 19.2 - 19.3)')
@Controller('api/v1/saas')
export class SaasBillingController {
  constructor(private readonly saasService: SaasBillingService) {}

  @Public()
  @Get('plans')
  @ApiOperation({
    summary: 'List active SaaS subscription tiers (Starter, Professional, Enterprise)',
    description: 'Retrieves canonical SaaS subscription plans with resource quotas and live subscriber counts.',
  })
  getPlans() {
    return this.saasService.getPlans();
  }

  @Post('plans')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create custom SaaS subscription plan tier' })
  createPlan(@Body(new ValidationPipe({ whitelist: true })) dto: CreateSaasPlanDto) {
    return this.saasService.createPlan(dto);
  }

  @Post('subscribe')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Subscribe or upgrade tenant organization to a SaaS tier',
    description: 'Executes commercial billing order and applies plan quotas to the calling tenant.',
  })
  subscribe(
    @Body(new ValidationPipe({ whitelist: true })) dto: SubscribePlanDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    const tenantId = user.organizationId || 'cb57c2f2-3810-4a0e-8af0-78ad02d69971';
    return this.saasService.subscribeTenant(tenantId, dto);
  }

  @Get('subscriptions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List tenant subscription invoice and order history' })
  getSubscriptions(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('tenantId') tenantIdQuery?: string,
  ) {
    const isSuper = user.isSuperAdmin || user.role === 'Platform SuperAdmin' || user.role === 'SuperAdmin';
    const targetTenantId = (isSuper && tenantIdQuery) ? tenantIdQuery : (user.organizationId || 'cb57c2f2-3810-4a0e-8af0-78ad02d69971');
    return this.saasService.getTenantSubscriptions(targetTenantId);
  }

  @Post('plan-requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit bespoke enterprise subscription plan request' })
  createPlanRequest(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreatePlanRequestDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    const tenantId = user.organizationId || 'cb57c2f2-3810-4a0e-8af0-78ad02d69971';
    return this.saasService.createPlanRequest(tenantId, dto);
  }

  @Get('plan-requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'SuperAdmin view of pending bespoke enterprise requests' })
  getPlanRequests() {
    return this.saasService.getPlanRequests();
  }

  @Post('plan-requests/:id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve custom enterprise plan request and activate subscription' })
  approvePlanRequest(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.saasService.approvePlanRequest(id, user.userId);
  }

  @Public()
  @Get('telemetry')
  @ApiOperation({
    summary: 'SuperAdmin Health Telemetry (Tenant Directory, Storage, Quota & Database health)',
  })
  getHealthTelemetry() {
    return this.saasService.getHealthTelemetry();
  }

  @Public()
  @Get('revenue-metrics')
  @ApiOperation({
    summary: 'Macro Revenue Dashboard (Monthly Recurring Revenue - MRR, ARR, Churn Rate, GMV)',
  })
  getRevenueMetrics() {
    return this.saasService.getRevenueMetrics();
  }

  @Public()
  @Get('feature-flags')
  @ApiOperation({ summary: 'List platform-wide global feature flags' })
  getFeatureFlags() {
    return this.saasService.getFeatureFlags();
  }

  @Put('feature-flags')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Globally toggle platform feature flag per plan or platform-wide' })
  toggleFeatureFlag(@Body(new ValidationPipe({ whitelist: true })) dto: ToggleFeatureFlagDto) {
    return this.saasService.toggleFeatureFlag(dto);
  }
}

