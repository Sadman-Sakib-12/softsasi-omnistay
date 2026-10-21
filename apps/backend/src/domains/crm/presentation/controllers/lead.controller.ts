import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { LeadApplicationService } from '../../application/services/lead.application-service.js';
import {
  AddLeadCallLogDto,
  AddLeadNoteDto,
  CreateLeadDto,
  CreateLeadStageDto,
} from '../dto/lead.dto.js';

@ApiTags('CRM - Lead Management & Pipeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/crm/leads')
export class LeadController {
  constructor(private readonly leadService: LeadApplicationService) {}

  @Post('stages')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Front Desk Agent')
  @ApiOperation({ summary: 'Create new lead pipeline stage' })
  createStage(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateLeadStageDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.leadService.createStage(tenantId, dto);
  }

  @Get('stages')
  @ApiOperation({ summary: 'List all lead pipeline stages' })
  getStages(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.leadService.getStages(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create lead with automated scoring' })
  createLead(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateLeadDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.leadService.createLead(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all leads for tenant' })
  getLeads(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.leadService.getLeads(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead details by ID' })
  getLeadById(@Param('id') id: string) {
    return this.leadService.getLeadById(id);
  }

  @Post(':id/assign-round-robin')
  @Roles('SuperAdmin', 'Company Owner/GM')
  @ApiOperation({ summary: 'Round-robin assign lead to sales managers' })
  assignRoundRobin(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('id') id: string,
    @Body('managerIds') managerIds: string[],
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.leadService.assignLeadRoundRobin(tenantId, id, managerIds);
  }

  @Post(':id/calls')
  @ApiOperation({ summary: 'Log phone call interaction with lead' })
  addCallLog(@Param('id') id: string, @Body() dto: AddLeadCallLogDto) {
    return this.leadService.addCallLog(id, dto);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add note/activity to lead dossier' })
  addNote(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('id') id: string,
    @Body() dto: AddLeadNoteDto,
  ) {
    return this.leadService.addNote(id, user.userId, dto);
  }

  @Patch(':id/stage/:stageId')
  @ApiOperation({ summary: 'Transition lead to another pipeline stage' })
  updateStage(@Param('id') id: string, @Param('stageId') stageId: string) {
    return this.leadService.updateLeadStage(id, stageId);
  }
}
