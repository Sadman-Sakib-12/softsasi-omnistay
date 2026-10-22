import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { AiConciergeService } from '../../application/services/ai-concierge.service.js';

@ApiTags('AI - Autonomous RAG Concierge')
@Controller('api/v1/ai/concierge')
export class AiConciergeController {
  constructor(private readonly conciergeService: AiConciergeService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send conversational query to RAG AI guest concierge' })
  chat(@Body() body: {
    tenantId: string;
    sessionId: string;
    message: string;
    channel?: 'web' | 'mobile' | 'whatsapp' | 'in_room_tablet';
    preferredLanguage?: string;
  }) {
    return this.conciergeService.handleChatMessage(body);
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
    return this.conciergeService.configureConcierge(user.organizationId || '00000000-0000-0000-0000-000000000001', body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('config')
  @ApiOperation({ summary: 'Get current AI concierge configuration' })
  getConfig(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.conciergeService.getConfig(user.organizationId || '00000000-0000-0000-0000-000000000001');
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
    return this.conciergeService.addKnowledgeDocument(user.organizationId || '00000000-0000-0000-0000-000000000001', body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('knowledge')
  @ApiOperation({ summary: 'List all indexed RAG knowledge documents' })
  getKnowledge(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('category') category?: string,
  ) {
    return this.conciergeService.getKnowledgeDocuments(user.organizationId || '00000000-0000-0000-0000-000000000001', category);
  }
}
