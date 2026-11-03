import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WebhookDispatcherService } from '../../application/services/webhook-dispatcher.service.js';
import { CreateWebhookDto, TestWebhookDto } from '../dto/webhook.dto.js';
import { JwtAuthGuard, CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Webhooks & Event Dispatches (Chapter 20.2)')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookDispatcherService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register new outbound webhook subscription',
    description: 'Subscribes an external URL to tenant events (booking.created, booking.cancelled, etc.) with HMAC-SHA256 signature security.',
  })
  @ApiResponse({ status: 201, description: 'Webhook created with secret key' })
  async createWebhook(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateWebhookDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.webhookService.createWebhook(user.organizationId || '', dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List tenant webhooks',
    description: 'Retrieves all registered webhooks for the active tenant partition along with recent delivery status summaries.',
  })
  @ApiResponse({ status: 200, description: 'List of webhooks' })
  async listWebhooks(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.webhookService.listWebhooks(user.organizationId || '');
  }

  @Get('deliveries/all')
  @ApiOperation({
    summary: 'List all webhook delivery history logs',
    description: 'Returns historical webhook deliveries, HTTP response status codes, and payload audits.',
  })
  @ApiResponse({ status: 200, description: 'List of delivery logs' })
  async getAllDeliveries(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.webhookService.getDeliveries(user.organizationId || '');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get webhook subscription details',
    description: 'Retrieves single webhook subscription by UUID.',
  })
  @ApiParam({ name: 'id', description: 'Webhook UUID' })
  @ApiResponse({ status: 200, description: 'Webhook details' })
  async getWebhook(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.webhookService.getWebhookById(user.organizationId || '', id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete webhook subscription',
    description: 'Deactivates and soft-deletes a webhook subscription.',
  })
  @ApiParam({ name: 'id', description: 'Webhook UUID' })
  @ApiResponse({ status: 200, description: 'Webhook deleted' })
  async deleteWebhook(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.webhookService.deleteWebhook(user.organizationId || '', id);
  }

  @Post(':id/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send test ping dispatch to webhook',
    description: 'Fires an immediate mock event to the target webhook URL and returns the HTTP status and delivery trace.',
  })
  @ApiParam({ name: 'id', description: 'Webhook UUID' })
  @ApiResponse({ status: 200, description: 'Test delivery executed' })
  async testWebhook(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: TestWebhookDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.webhookService.testWebhook(user.organizationId || '', id, dto);
  }

  @Get(':id/deliveries')
  @ApiOperation({
    summary: 'List delivery logs for a specific webhook',
    description: 'Returns historical deliveries for this webhook subscriber.',
  })
  @ApiParam({ name: 'id', description: 'Webhook UUID' })
  @ApiResponse({ status: 200, description: 'Webhook deliveries' })
  async getWebhookDeliveries(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.webhookService.getDeliveries(user.organizationId || '', id);
  }
}

