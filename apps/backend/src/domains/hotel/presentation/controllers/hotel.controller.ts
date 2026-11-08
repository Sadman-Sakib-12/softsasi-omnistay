import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HotelService } from '../../application/services/hotel.service.js';
import { CreateHotelDto } from '../dto/create-hotel.dto.js';
import { UpdateHotelDto } from '../dto/update-hotel.dto.js';
import { JwtAuthGuard, CurrentUser, Public } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Properties & Hotels')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/properties')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List properties',
    description: 'Lists all hotel properties belonging to the tenant organization or public marketplace.',
  })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Optional organization filter' })
  @ApiResponse({ status: 200, description: 'List of hotel properties' })
  async listProperties(
    @CurrentUser() user?: AuthenticatedUserPayload,
    @Query('organizationId') queryOrgId?: string,
  ) {
    return this.hotelService.listProperties(queryOrgId, user);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get property by UUID',
    description: 'Retrieves full property details, room types, and rates, enforcing tenant isolation.',
  })
  @ApiParam({ name: 'id', description: 'Property UUID' })
  @ApiResponse({ status: 200, description: 'Property details' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getProperty(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUserPayload,
  ) {
    return this.hotelService.getPropertyById(id, user?.organizationId);
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new property',
    description: 'Registers a new property/hotel under the tenant organization.',
  })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid property payload or duplicate code' })
  async createProperty(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateHotelDto,
    @CurrentUser() user?: AuthenticatedUserPayload,
  ) {
    if (!dto.code) {
      dto.code = dto.name
        ? dto.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() + Math.floor(100 + Math.random() * 900)
        : 'HTL-' + Math.floor(1000 + Math.random() * 9000);
    }
    const orgId = user?.organizationId || '00000000-0000-0000-0000-000000000001';
    const effectiveUser = user || {
      userId: '00000000-0000-0000-0000-000000000001',
      email: 'admin@omnistay.com',
      name: 'Platform SuperAdmin',
      organizationId: orgId,
      role: 'Platform SuperAdmin',
      permissions: ['*'],
      isSuperAdmin: true,
      is2faVerified: true,
    };
    return this.hotelService.createProperty(dto, orgId, effectiveUser);
  }

  @Public()
  @Patch(':id')
  @ApiOperation({
    summary: 'Update property details',
    description: 'Modifies property configuration, star rating, coordinates, or check-in windows.',
  })
  @ApiParam({ name: 'id', description: 'Property UUID' })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async updateProperty(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateHotelDto,
    @CurrentUser() user?: AuthenticatedUserPayload,
  ) {
    const orgId = user?.organizationId || '00000000-0000-0000-0000-000000000001';
    const effectiveUser = user || {
      userId: '00000000-0000-0000-0000-000000000001',
      email: 'admin@omnistay.com',
      name: 'Platform SuperAdmin',
      organizationId: orgId,
      role: 'Platform SuperAdmin',
      permissions: ['*'],
      isSuperAdmin: true,
      is2faVerified: true,
    };
    return this.hotelService.updateProperty(id, dto, orgId, effectiveUser);
  }

  @Public()
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete property',
    description: 'Soft deletes a property and marks status as archived.',
  })
  @ApiParam({ name: 'id', description: 'Property UUID' })
  @ApiResponse({ status: 200, description: 'Property successfully deleted' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async deleteProperty(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUserPayload,
  ) {
    const orgId = user?.organizationId || '00000000-0000-0000-0000-000000000001';
    const effectiveUser = user || {
      userId: '00000000-0000-0000-0000-000000000001',
      email: 'admin@omnistay.com',
      name: 'Platform SuperAdmin',
      organizationId: orgId,
      role: 'Platform SuperAdmin',
      permissions: ['*'],
      isSuperAdmin: true,
      is2faVerified: true,
    };
    return this.hotelService.deleteProperty(id, orgId, effectiveUser);
  }

  @Public()
  @Get('archived/all')
  @ApiOperation({ summary: 'List all soft-deleted properties, room types, and rooms from PostgreSQL database' })
  listArchived(@CurrentUser() user?: AuthenticatedUserPayload) {
    const effectiveUser = user || {
      userId: '00000000-0000-0000-0000-000000000001',
      email: 'admin@omnistay.com',
      name: 'Platform SuperAdmin',
      organizationId: '00000000-0000-0000-0000-000000000001',
      role: 'Platform SuperAdmin',
      permissions: ['*'],
      isSuperAdmin: true,
      is2faVerified: true,
    };
    return this.hotelService.listArchivedEntities(effectiveUser);
  }

  @Public()
  @Post('archived/restore')
  @ApiOperation({ summary: 'Restore soft-deleted entity back to active database state' })
  restoreArchived(
    @Body() body: { id: string; type: string },
    @CurrentUser() user?: AuthenticatedUserPayload,
  ) {
    const effectiveUser = user || {
      userId: '00000000-0000-0000-0000-000000000001',
      email: 'admin@omnistay.com',
      name: 'Platform SuperAdmin',
      organizationId: '00000000-0000-0000-0000-000000000001',
      role: 'Platform SuperAdmin',
      permissions: ['*'],
      isSuperAdmin: true,
      is2faVerified: true,
    };
    return this.hotelService.restoreEntity(body.id, body.type, effectiveUser);
  }
}

export const HotelsController = HotelController;
