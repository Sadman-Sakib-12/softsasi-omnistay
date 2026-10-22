import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { WhatsappService } from '../../application/services/whatsapp.service.js';

@ApiTags('Omnichannel - WhatsApp Business API')
@Controller('api/v1/communications/whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('send')
  @ApiOperation({ summary: 'Send automated transactional WhatsApp message or template trigger' })
  sendMessage(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() body: {
      recipientNo: string;
      templateName?: string;
      customMessage?: string;
      mergeVariables?: Record<string, string>;
    },
  ) {
    return this.whatsappService.sendWhatsapp({
      tenantId: user.organizationId || '00000000-0000-0000-0000-000000000001',
      ...body,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('messages')
  @ApiOperation({ summary: 'List recent inbound and outbound WhatsApp communications' })
  getMessages(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.whatsappService.getMessages(user.organizationId || '00000000-0000-0000-0000-000000000001');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('templates')
  @ApiOperation({ summary: 'Register approved WhatsApp HSM notification template' })
  createTemplate(
    @Body() body: {
      name: string;
      category: 'booking_confirmation' | 'pre_arrival_checkin' | 'room_ready' | 'folio_receipt' | 'support_concierge';
      content: string;
      isApproved?: boolean;
    },
  ) {
    return this.whatsappService.createTemplate(body);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Inbound WhatsApp webhook endpoint with HMAC signature validation' })
  handleWebhook(
    @Headers('x-softsasi-signature') signature: string,
    @Body() body: any,
  ) {
    const rawPayload = JSON.stringify(body);
    const secretKey = process.env.WHATSAPP_WEBHOOK_SECRET || 'omnistay_whatsapp_secret';
    return this.whatsappService.handleInboundWebhook(rawPayload, signature, secretKey, body);
  }
}
