import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { HotelService } from '../services/hotel.service.js';
import { CreateHotelDto } from '../dto/create-hotel.dto.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUserPayload } from '../../../common/decorators/current-user.decorator.js';

@ApiTags('Properties & Hotels')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/properties')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Get()
  @ApiOperation({
    summary: 'List properties',
    description: 'Lists all hotel properties belonging to the tenant organization.',
  })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Optional organization filter' })
  @ApiResponse({ status: 200, description: 'List of hotel properties' })
  @ApiResponse({ status: 403, description: 'Access to organization denied' })
  async listProperties(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('organizationId') queryOrgId?: string,
  ) {
    const orgId = queryOrgId || user.organizationId;
    return this.hotelService.listProperties(orgId, user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get property by UUID',
    description: 'Retrieves property details, enforcing tenant isolation.',
  })
  @ApiParam({ name: 'id', description: 'Property UUID' })
  @ApiResponse({ status: 200, description: 'Property details' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getProperty(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.hotelService.getPropertyById(id, user.organizationId);
  }

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
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.hotelService.createProperty(dto, user.organizationId || '', user);
  }
}

export const HotelsController = HotelController;
