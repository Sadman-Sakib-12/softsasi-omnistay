import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { ICommunicationRepository } from '../../domain/repositories/communication.repository.interface.js';
import { COMMUNICATION_REPOSITORY_TOKEN } from '../../domain/repositories/communication.repository.interface.js';
import { renderTemplate } from '../../domain/rules/template-engine.rule.js';
import {
  RenderEmailTemplateRequest,
  RenderEmailTemplateResult,
} from '@omnistay/shared-types';

@Injectable()
export class EmailTemplateService {
  constructor(
    @Inject(COMMUNICATION_REPOSITORY_TOKEN)
    private readonly commRepo: ICommunicationRepository,
  ) {}

  async createTemplate(data: {
    name: string;
    subject: string;
    htmlBody: string;
    mergeTags?: string[];
  }) {
    return this.commRepo.createEmailTemplate({
      name: data.name,
      subject: data.subject,
      htmlBody: data.htmlBody,
      mergeTags: data.mergeTags || [],
    });
  }

  async getTemplates() {
    return this.commRepo.findEmailTemplates();
  }

  async renderTemplate(req: RenderEmailTemplateRequest): Promise<RenderEmailTemplateResult> {
    const template = await this.commRepo.findEmailTemplateByName(req.templateName);
    if (!template) {
      throw new BadRequestException(`Email template '${req.templateName}' not found.`);
    }

    const subjectRender = renderTemplate(template.subject, req.mergeData);
    const bodyRender = renderTemplate(template.htmlBody, req.mergeData);

    const missingTags = [...new Set([...subjectRender.missingTags, ...bodyRender.missingTags])];

    return {
      templateName: req.templateName,
      subject: subjectRender.rendered,
      renderedHtml: bodyRender.rendered,
      missingTags,
    };
  }

  async sendEmail(data: {
    recipient: string;
    subject: string;
    htmlBody: string;
    provider?: string;
  }) {
    return this.commRepo.createEmailLog({
      recipient: data.recipient,
      subject: data.subject,
      status: 'sent',
      provider: data.provider || 'smtp',
    });
  }

  async createCampaign(tenantId: string, data: {
    campaignName: string;
    subject: string;
    recipientCount?: number;
    scheduledAt?: Date;
  }) {
    return this.commRepo.createEmailCampaign({
      tenantId,
      campaignName: data.campaignName,
      subject: data.subject,
      recipientCount: data.recipientCount || 0,
      sentCount: 0,
      status: 'scheduled',
      scheduledAt: data.scheduledAt || null,
    });
  }

  async getCampaigns(tenantId: string) {
    return this.commRepo.findEmailCampaigns(tenantId);
  }

  async getLogs(recipient?: string) {
    return this.commRepo.findEmailLogs(recipient);
  }
}
