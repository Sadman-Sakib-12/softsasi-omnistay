import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Public } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { EmailTemplateService } from '../../application/services/email-template.service.js';

@ApiTags('Omnichannel - Dynamic Email Templates & Campaigns')
@Controller('api/v1/communications/email')
export class EmailTemplateController {
  constructor(private readonly emailService: EmailTemplateService) {}

  @Public()
  @Post('templates')
  @ApiOperation({ summary: 'Register HTML email template with dynamic merge tags' })
  createTemplate(@Body() body: {
    name: string;
    subject: string;
    htmlBody: string;
    mergeTags?: string[];
  }) {
    return this.emailService.createTemplate(body);
  }

  @Public()
  @Get('templates')
  @ApiOperation({ summary: 'List all dynamic email templates' })
  getTemplates() {
    return this.emailService.getTemplates();
  }

  @Public()
  @Put('templates/:id')
  @ApiOperation({ summary: 'Update existing email template' })
  updateTemplate(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      subject?: string;
      htmlBody?: string;
      mergeTags?: string[];
    },
  ) {
    return this.emailService.updateTemplate(id, body);
  }

  @Public()
  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete email template' })
  deleteTemplate(@Param('id') id: string) {
    return this.emailService.deleteTemplate(id);
  }

  @Public()
  @Post('render')
  @ApiOperation({ summary: 'Render dynamic template with provided merge variables' })
  renderTemplate(@Body() body: {
    templateName: string;
    mergeData: Record<string, string | number>;
  }) {
    return this.emailService.renderTemplate(body);
  }

  @Public()
  @Post('send')
  @ApiOperation({ summary: 'Send rendered email and record delivery log' })
  sendEmail(@Body() body: {
    recipient: string;
    subject: string;
    htmlBody: string;
    provider?: string;
  }) {
    return this.emailService.sendEmail(body);
  }

  @Public()
  @Post('campaigns')
  @ApiOperation({ summary: 'Schedule targeted email marketing campaign' })
  createCampaign(
    @CurrentUser() user?: AuthenticatedUserPayload,
    @Body() body?: {
      campaignName: string;
      subject: string;
      recipientCount?: number;
      scheduledAt?: string;
    },
  ) {
    return this.emailService.createCampaign(user?.organizationId || '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525', {
      ...body!,
      scheduledAt: body?.scheduledAt ? new Date(body.scheduledAt) : undefined,
    });
  }

  @Public()
  @Get('campaigns')
  @ApiOperation({ summary: 'List tenant email campaigns' })
  getCampaigns(@CurrentUser() user?: AuthenticatedUserPayload) {
    return this.emailService.getCampaigns(user?.organizationId || '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525');
  }

  @Public()
  @Get('logs')
  @ApiOperation({ summary: 'List email audit delivery logs' })
  getLogs(@Query('recipient') recipient?: string) {
    return this.emailService.getLogs(recipient);
  }
}
