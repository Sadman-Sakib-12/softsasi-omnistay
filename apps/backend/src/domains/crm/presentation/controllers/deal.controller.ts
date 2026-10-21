import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { DealApplicationService } from '../../application/services/deal.application-service.js';
import {
  CreateBanquetContractDto,
  CreateDealDto,
  CreateDealProposalDto,
  CreateDealStageDto,
  SignContractDto,
} from '../dto/deal.dto.js';

@ApiTags('CRM - Banquet Deals & Sales Kanban')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/crm/deals')
export class DealController {
  constructor(private readonly dealService: DealApplicationService) {}

  @Post('stages')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Front Desk Agent')
  @ApiOperation({ summary: 'Create new banquet deal stage' })
  createStage(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateDealStageDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.dealService.createStage(tenantId, dto);
  }

  @Get('stages')
  @ApiOperation({ summary: 'List deal stages with deals' })
  getStages(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.dealService.getStages(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new banquet deal' })
  createDeal(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateDealDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.dealService.createDeal(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all banquet deals' })
  getDeals(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.dealService.getDeals(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deal by ID' })
  getDealById(@Param('id') id: string) {
    return this.dealService.getDealById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update deal status (open, won, lost)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.dealService.updateDealStatus(id, status);
  }

  @Post(':id/proposals')
  @ApiOperation({ summary: 'Create proposal for deal' })
  createProposal(@Param('id') id: string, @Body() dto: CreateDealProposalDto) {
    return this.dealService.createProposal(id, dto);
  }

  @Post(':id/contracts')
  @ApiOperation({ summary: 'Generate banquet contract' })
  createContract(@Param('id') id: string, @Body() dto: CreateBanquetContractDto) {
    return this.dealService.createBanquetContract(id, dto);
  }

  @Post('contracts/:contractId/sign')
  @ApiOperation({ summary: 'Submit e-signature for banquet contract' })
  signContract(
    @Param('contractId') contractId: string,
    @Body() dto: SignContractDto,
  ) {
    return this.dealService.signContract(contractId, dto);
  }
}
