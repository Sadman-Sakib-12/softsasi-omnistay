import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Public, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { FormApplicationService } from '../../application/services/form.application-service.js';
import { CreateFormBuilderDto, SubmitFormResponseDto } from '../dto/form.dto.js';

@ApiTags('CRM - Dynamic Form Builder & Submissions')
@Controller('api/v1/crm/forms')
export class FormBuilderController {
  constructor(private readonly formService: FormApplicationService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create new dynamic form builder schema' })
  createForm(
    @CurrentUser() user?: AuthenticatedUserPayload,
    @Body() dto?: CreateFormBuilderDto,
  ) {
    const tenantId = user?.organizationId || '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525';
    return this.formService.createForm(tenantId, dto!);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all forms for tenant' })
  getForms(
    @CurrentUser() user?: AuthenticatedUserPayload,
    @Query('tenantId') tenantQuery?: string,
  ) {
    const tenantId = tenantQuery || user?.organizationId || '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525';
    return this.formService.getForms(tenantId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get public form schema by ID' })
  getFormById(@Param('id') id: string) {
    return this.formService.getFormById(id);
  }

  @Public()
  @Put(':id')
  @ApiOperation({ summary: 'Update form schema by ID' })
  updateForm(
    @Param('id') id: string,
    @Body() dto: Partial<CreateFormBuilderDto>,
  ) {
    return this.formService.updateForm(id, dto);
  }

  @Public()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete form by ID' })
  deleteForm(@Param('id') id: string) {
    return this.formService.deleteForm(id);
  }

  @Public()
  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit response to form (public, auto-generates CRM lead)' })
  submitResponse(
    @Param('id') id: string,
    @Body() dto: SubmitFormResponseDto,
  ) {
    return this.formService.submitResponse(id, dto);
  }

  @Public()
  @Get(':id/responses')
  @ApiOperation({ summary: 'Get all submitted responses for form' })
  getResponses(@Param('id') id: string) {
    return this.formService.getFormResponses(id);
  }
}
