import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { EmailTemplateService } from '../../application/services/email-template.service.js';

@ApiTags('Omnichannel - Dynamic Email Templates & Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/communications/email')
export class EmailTemplateController {
  constructor(private readonly emailService: EmailTemplateService) {}

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

  @Get('templates')
  @ApiOperation({ summary: 'List all dynamic email templates' })
  getTemplates() {
    return this.emailService.getTemplates();
  }

  @Post('render')
  @ApiOperation({ summary: 'Render dynamic template with provided merge variables' })
  renderTemplate(@Body() body: {
    templateName: string;
    mergeData: Record<string, string | number>;
  }) {
    return this.emailService.renderTemplate(body);
  }

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

  @Post('campaigns')
  @ApiOperation({ summary: 'Schedule targeted email marketing campaign' })
  createCampaign(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() body: {
      campaignName: string;
      subject: string;
      recipientCount?: number;
      scheduledAt?: string;
    },
  ) {
    return this.emailService.createCampaign(user.organizationId || '00000000-0000-0000-0000-000000000001', {
      ...body,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    });
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'List tenant email campaigns' })
  getCampaigns(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.emailService.getCampaigns(user.organizationId || '00000000-0000-0000-0000-000000000001');
  }

  @Get('logs')
  @ApiOperation({ summary: 'List email audit delivery logs' })
  getLogs(@Query('recipient') recipient?: string) {
    return this.emailService.getLogs(recipient);
  }
}
