import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { ChatService } from '../../application/services/chat.service.js';

@ApiTags('Omnichannel - Real-Time Chat & Channels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/communications/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @ApiOperation({ summary: 'Send 1-to-1 direct message or post to staff operational channel' })
  sendMessage(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() body: { toId?: string; channelId?: string; body: string; attachment?: string },
  ) {
    return this.chatService.sendMessage({
      fromId: user.userId,
      ...body,
    });
  }

  @Get('direct/:otherUserId')
  @ApiOperation({ summary: 'Retrieve direct 1-to-1 conversation history with another user' })
  getDirectMessages(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('otherUserId') otherUserId: string,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getDirectMessages(user.userId, otherUserId, limit ? Number(limit) : 50);
  }

  @Get('channels/:channelId/messages')
  @ApiOperation({ summary: 'Retrieve channel messages (e.g. #FrontDesk-Housekeeping)' })
  getChannelMessages(
    @Param('channelId') channelId: string,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getChannelMessages(channelId, limit ? Number(limit) : 50);
  }

  @Post('channels')
  @ApiOperation({ summary: 'Create new staff or guest chat channel' })
  createChannel(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() body: { channelName: string; isPrivate?: boolean },
  ) {
    return this.chatService.createChannel(user.organizationId || '00000000-0000-0000-0000-000000000001', {
      ...body,
      creatorId: user.userId,
    });
  }

  @Get('channels')
  @ApiOperation({ summary: 'List all available channels for tenant' })
  getChannels(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.chatService.getChannels(user.organizationId || '00000000-0000-0000-0000-000000000001');
  }

  @Post('channels/:channelId/join')
  @ApiOperation({ summary: 'Join an operational channel' })
  joinChannel(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('channelId') channelId: string,
  ) {
    return this.chatService.joinChannel(channelId, user.userId);
  }
}
