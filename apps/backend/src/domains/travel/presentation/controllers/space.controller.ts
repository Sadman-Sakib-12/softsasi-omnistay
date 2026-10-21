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
import { SpaceService } from '../../application/services/space.service.js';
import { BookSpaceDto, CreateSpaceDto, UpdateSpaceDto } from '../dto/space.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Spaces & Coworking')
@Controller('api/v1/spaces')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Get()
  @ApiOperation({ summary: 'List spaces & venues', description: 'Lists all available coworking spaces, meeting rooms, and banquet halls.' })
  @ApiQuery({ name: 'venueType', required: false, description: 'Filter by venue type (e.g., meeting_room, ballroom)' })
  @ApiQuery({ name: 'minCapacity', required: false, description: 'Minimum guest capacity' })
  @ApiResponse({ status: 200, description: 'List of spaces' })
  async listSpaces(
    @Query('venueType') venueType?: string,
    @Query('minCapacity') minCapacity?: number,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.spaceService.listSpaces(tenantId, { venueType, minCapacity });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get space by ID', description: 'Retrieves complete space details, hourly/daily pricing, and amenities.' })
  @ApiParam({ name: 'id', description: 'Space UUID' })
  @ApiResponse({ status: 200, description: 'Space details' })
  @ApiResponse({ status: 404, description: 'Space not found' })
  async getSpace(@Param('id') id: string) {
    return this.spaceService.getSpaceById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new space/venue', description: 'Registers a new venue or coworking space for the tenant.' })
  @ApiResponse({ status: 201, description: 'Space created successfully' })
  async createSpace(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateSpaceDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.spaceService.createSpace(dto, user.organizationId || '', user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiOperation({ summary: 'Update space details' })
  @ApiParam({ name: 'id', description: 'Space UUID' })
  async updateSpace(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateSpaceDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.spaceService.updateSpace(id, dto, user.organizationId || '', user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiOperation({ summary: 'Archive/delete space' })
  @ApiParam({ name: 'id', description: 'Space UUID' })
  async deleteSpace(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.spaceService.deleteSpace(id, user.organizationId || '', user);
  }

  @Post('book')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book space', description: 'Books an hourly or daily slot in the space.' })
  async bookSpace(
    @Body(new ValidationPipe({ whitelist: true })) dto: BookSpaceDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.spaceService.bookSpace(dto, user.userId);
  }
}
