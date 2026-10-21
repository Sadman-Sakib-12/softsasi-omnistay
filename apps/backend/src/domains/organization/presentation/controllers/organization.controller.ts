import {
  Body,
  Controller,
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
import { OrganizationService } from '../../application/services/organization.service.js';
import { CreateOrganizationDto } from '../dto/create-organization.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Organizations & Tenants')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @ApiOperation({
    summary: 'List user organizations',
    description: 'Retrieves all tenant organizations where current user has verified membership.',
  })
  @ApiResponse({ status: 200, description: 'List of tenant organizations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyOrganizations(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.organizationService.getUserOrganizations(user.userId);
  }

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
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.organizationService.getOrganizationById(id, user);
  }

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
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.organizationService.createOrganization(dto, user);
  }
}

export const OrganizationsController = OrganizationController;
