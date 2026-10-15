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
import { OrganizationService } from '../services/organization.service.js';
import { CreateOrganizationDto } from '../dto/create-organization.dto.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUserPayload } from '../../../common/decorators/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  async getMyOrganizations(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.organizationService.getUserOrganizations(user.userId);
  }

  @Get(':id')
  async getOrganization(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.organizationService.getOrganizationById(id, user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrganization(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateOrganizationDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.organizationService.createOrganization(dto, user);
  }
}

export const OrganizationsController = OrganizationController;
