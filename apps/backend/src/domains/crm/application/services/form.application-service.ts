import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IFormRepository } from '../../domain/repositories/form.repository.interface.js';
import { FORM_REPOSITORY_TOKEN } from '../../domain/repositories/form.repository.interface.js';
import {
  CreateFormBuilderDto,
  SubmitFormResponseDto,
} from '../../presentation/dto/form.dto.js';
import { LeadApplicationService } from './lead.application-service.js';

@Injectable()
export class FormApplicationService {
  constructor(
    @Inject(FORM_REPOSITORY_TOKEN)
    private readonly formRepo: IFormRepository,
    private readonly leadService: LeadApplicationService,
  ) {}

  async createForm(tenantId: string, dto: CreateFormBuilderDto) {
    return this.formRepo.createForm({
      tenantId,
      formName: dto.formName,
      formSchema: dto.formSchema,
      isActive: dto.isActive ?? true,
    });
  }

  async getForms(tenantId: string) {
    return this.formRepo.findForms(tenantId);
  }

  async getFormById(id: string) {
    const form = await this.formRepo.findFormById(id);
    if (!form) throw new NotFoundException(`Form ${id} not found`);
    return form;
  }

  async submitResponse(formId: string, dto: SubmitFormResponseDto) {
    const form = await this.getFormById(formId);

    const response = await this.formRepo.createResponse({
      formId,
      formData: dto.formData,
      submitterIp: dto.submitterIp,
    });

    // Auto-convert form submission into CRM Lead if contact details are present
    const fullName = dto.formData['fullName'] || dto.formData['name'] || dto.formData['contactName'];
    const email = dto.formData['email'];
    const phone = dto.formData['phone'];
    const budget = Number(dto.formData['budget']) || undefined;
    const guestCount = Number(dto.formData['headcount'] || dto.formData['guests']) || undefined;

    if (fullName) {
      await this.leadService.createLead(form.tenantId, {
        title: `Inquiry from ${form.formName}`,
        contactName: String(fullName),
        email: email ? String(email) : undefined,
        phone: phone ? String(phone) : undefined,
        source: 'form_builder',
        budget,
        guestCount,
      });
    }

    return response;
  }

  async getFormResponses(formId: string) {
    await this.getFormById(formId);
    return this.formRepo.findResponses(formId);
  }
}
