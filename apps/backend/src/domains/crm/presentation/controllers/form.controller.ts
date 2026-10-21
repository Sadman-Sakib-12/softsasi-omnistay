import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { FormApplicationService } from '../../application/services/form.application-service.js';
import { CreateFormBuilderDto, SubmitFormResponseDto } from '../dto/form.dto.js';

@ApiTags('CRM - Dynamic Form Builder & Submissions')
@Controller('api/v1/crm/forms')
export class FormBuilderController {
  constructor(private readonly formService: FormApplicationService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM')
  @ApiOperation({ summary: 'Create new dynamic form builder schema' })
  createForm(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateFormBuilderDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.formService.createForm(tenantId, dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'List all forms for tenant' })
  getForms(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.formService.getForms(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public form schema by ID' })
  getFormById(@Param('id') id: string) {
    return this.formService.getFormById(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit response to form (public, auto-generates CRM lead)' })
  submitResponse(
    @Param('id') id: string,
    @Body() dto: SubmitFormResponseDto,
  ) {
    return this.formService.submitResponse(id, dto);
  }

  @Get(':id/responses')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all submitted responses for form' })
  getResponses(@Param('id') id: string) {
    return this.formService.getFormResponses(id);
  }
}
