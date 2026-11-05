import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { AiConciergeService } from '../../application/services/ai-concierge.service.js';

@ApiTags('AI - Autonomous RAG Concierge')
@Controller('api/v1/ai/concierge')
export class AiConciergeController {
  constructor(private readonly conciergeService: AiConciergeService) {}

  @Get('agents')
  @ApiOperation({ summary: 'List all configured autonomous AI customer service agents (Figure 14.1)' })
  getAgents(@CurrentUser() user?: AuthenticatedUserPayload) {
    const tenantId = user?.organizationId || '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525';
    return this.conciergeService.getConfiguredAgents(tenantId);
  }

  @Get('telemetry')
  @ApiOperation({ summary: 'Get real-time conversational telemetry, conversion tracking & sentiment analytics (Figure 14.2)' })
  getTelemetry(@CurrentUser() user?: AuthenticatedUserPayload) {
    const tenantId = user?.organizationId || '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525';
    return this.conciergeService.getTelemetry(tenantId);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Send conversational query to RAG AI guest concierge' })
  chat(@Body() body: {
    tenantId?: string;
    sessionId: string;
    message: string;
    channel?: 'web' | 'mobile' | 'whatsapp' | 'in_room_tablet';
    preferredLanguage?: string;
  }) {
    return this.conciergeService.handleChatMessage({
      tenantId: body.tenantId || '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525',
      ...body,
    });
  }

  @Get('history/:sessionId')
  @ApiOperation({ summary: 'Retrieve conversation history by session ID' })
  getHistory(@Param('sessionId') sessionId: string) {
    return this.conciergeService.getConversationHistory(sessionId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('config')
  @ApiOperation({ summary: 'Configure AI agent prompt, provider and temperature' })
  updateConfig(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() body: {
      agentName: string;
      systemPrompt: string;
      modelProvider?: string;
      modelName?: string;
      temperature?: number;
      isEnabled?: boolean;
    },
  ) {
    return this.conciergeService.configureConcierge(user.organizationId || '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525', body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('config')
  @ApiOperation({ summary: 'Get current AI concierge configuration' })
  getConfig(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.conciergeService.getConfig(user.organizationId || '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('knowledge')
  @ApiOperation({ summary: 'Ingest and index property knowledge document for RAG search' })
  addKnowledge(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() body: {
      title: string;
      content: string;
      category?: 'property_info' | 'amenities' | 'policies' | 'dining_menu' | 'local_attractions';
    },
  ) {
    return this.conciergeService.addKnowledgeDocument(user.organizationId || '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525', body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('knowledge')
  @ApiOperation({ summary: 'List all indexed RAG knowledge documents' })
  getKnowledge(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('category') category?: string,
  ) {
    return this.conciergeService.getKnowledgeDocuments(user.organizationId || '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525', category);
  }
}
