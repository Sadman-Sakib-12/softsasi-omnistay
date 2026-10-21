import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { SupportApplicationService } from '../../application/services/support.application-service.js';
import {
  CreateCannedResponseDto,
  CreateKnowledgeBaseItemDto,
  CreateSupportTicketDto,
  ReplySupportTicketDto,
} from '../dto/support.dto.js';

@ApiTags('CRM - Support Tickets & Guest Care')
@Controller('api/v1/crm/support')
export class SupportTicketController {
  constructor(private readonly supportService: SupportApplicationService) {}

  @Post('tickets')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Open guest support ticket' })
  createTicket(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateSupportTicketDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.supportService.createTicket(tenantId, dto);
  }

  @Get('tickets')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'Front Desk Agent')
  @ApiOperation({ summary: 'List all support tickets for tenant' })
  getTickets(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.supportService.getTickets(tenantId);
  }

  @Get('tickets/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get support ticket conversation history' })
  getTicketById(@Param('id') id: string) {
    return this.supportService.getTicketById(id);
  }

  @Post('tickets/:id/replies')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add reply message to ticket' })
  replyTicket(@Param('id') id: string, @Body() dto: ReplySupportTicketDto) {
    return this.supportService.replyTicket(id, dto);
  }

  @Patch('tickets/:id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'Front Desk Agent')
  @ApiOperation({ summary: 'Update ticket resolution status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.supportService.updateTicketStatus(id, status);
  }

  @Post('canned-responses')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'Front Desk Agent')
  @ApiOperation({ summary: 'Create fast canned response macro' })
  createCannedResponse(@Body() dto: CreateCannedResponseDto) {
    return this.supportService.createCannedResponse(dto);
  }

  @Get('canned-responses')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all canned responses' })
  getCannedResponses() {
    return this.supportService.getCannedResponses();
  }

  @Post('knowledge-base')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM')
  @ApiOperation({ summary: 'Add article to knowledge base' })
  createKnowledgeBase(@Body() dto: CreateKnowledgeBaseItemDto) {
    return this.supportService.createKnowledgeBase(dto);
  }

  @Get('knowledge-base')
  @ApiOperation({ summary: 'Search and read knowledge base articles' })
  getKnowledgeBase(@Query('category') category?: string) {
    return this.supportService.getKnowledgeBase(category);
  }
}
