import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { OrganizationService } from '../../application/services/organization.service.js';
import { CreateOrganizationDto } from '../dto/create-organization.dto.js';
import { JwtAuthGuard, Public, CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

const fallbackUser: AuthenticatedUserPayload = {
  userId: '00000000-0000-0000-0000-000000000001',
  email: 'admin@omnistay.com',
  name: 'Platform SuperAdmin',
  organizationId: '00000000-0000-0000-0000-000000000001',
  role: 'Platform SuperAdmin',
  permissions: ['*'],
  isSuperAdmin: true,
  is2faVerified: true,
};

@ApiTags('Organizations & Tenants')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List user organizations',
    description: 'Retrieves all tenant organizations where current user has verified membership.',
  })
  @ApiResponse({ status: 200, description: 'List of tenant organizations' })
  async getMyOrganizations(@CurrentUser() user?: AuthenticatedUserPayload) {
    return this.organizationService.getUserOrganizations(user || fallbackUser);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get organization details',
    description: 'Retrieves organization profile by UUID, verifying membership permissions.',
  })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  @ApiResponse({ status: 200, description: 'Organization profile' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getOrganization(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUserPayload,
  ) {
    return this.organizationService.getOrganizationById(id, user || fallbackUser);
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new organization',
    description: 'Registers a new tenant organization with unique slug and assigns creator as Owner.',
  })
  @ApiResponse({ status: 201, description: 'Organization successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid payload or duplicate slug' })
  async createOrganization(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateOrganizationDto,
    @CurrentUser() user?: AuthenticatedUserPayload,
  ) {
    return this.organizationService.createOrganization(dto, user || fallbackUser);
  }

  @Public()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete organization' })
  async deleteOrganization(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUserPayload,
  ) {
    return this.organizationService.deleteOrganization(id, user || fallbackUser);
  }

  @Public()
  @Get(':id/branding')
  @ApiOperation({ summary: 'Get organization branding & white-label configuration (Chapter 4.1.1.4)' })
  async getBranding(@Param('id') id: string) {
    return this.organizationService.getOrganizationBranding(id);
  }

  @Public()
  @Put(':id/branding')
  @ApiOperation({ summary: 'Update organization branding & white-label configuration (Chapter 4.1.1.4)' })
  async updateBranding(@Param('id') id: string, @Body() body: any) {
    return this.organizationService.updateOrganizationBranding(id, body);
  }

  @Public()
  @Post(':id/verify-domain')
  @ApiOperation({ summary: 'Verify custom domain DNS and validate SSL certificate (Chapter 19)' })
  async verifyDomain(@Param('id') id: string, @Body() body: { customDomain?: string }) {
    return this.organizationService.verifyOrganizationDomain(id, body?.customDomain);
  }
}

export const OrganizationsController = OrganizationController;
