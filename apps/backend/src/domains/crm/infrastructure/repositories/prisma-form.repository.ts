import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IFormRepository } from '../../domain/repositories/form.repository.interface.js';

@Injectable()
export class PrismaFormRepository implements IFormRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createForm(data: {
    tenantId: string;
    formName: string;
    formSchema: Record<string, any>;
    isActive: boolean;
  }) {
    return this.prisma.formBuilder.create({ data });
  }

  async findForms(tenantId: string) {
    return this.prisma.formBuilder.findMany({
      where: { tenantId },
      include: {
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findFormById(id: string) {
    return this.prisma.formBuilder.findUnique({
      where: { id },
      include: { responses: true },
    });
  }

  async createResponse(data: {
    formId: string;
    formData: Record<string, any>;
    submitterIp?: string;
  }) {
    return this.prisma.formResponse.create({ data });
  }

  async findResponses(formId: string) {
    return this.prisma.formResponse.findMany({
      where: { formId },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
