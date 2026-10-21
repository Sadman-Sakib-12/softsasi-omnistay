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
import { TourService } from '../../application/services/tour.service.js';
import { BookTourDto, CreateTourDto, UpdateTourDto } from '../dto/tour.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Tours & Activities')
@Controller('api/v1/tours')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Get()
  @ApiOperation({ summary: 'List tours & activities', description: 'Lists available guided tours, excursions, and activities.' })
  @ApiQuery({ name: 'minPax', required: false, description: 'Minimum passenger capacity' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum adult ticket price' })
  async listTours(
    @Query('minPax') minPax?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.tourService.listTours(tenantId, { minPax, maxPrice });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tour by ID', description: 'Retrieves full tour package, day-by-day itineraries, and inclusions.' })
  @ApiParam({ name: 'id', description: 'Tour UUID' })
  async getTour(@Param('id') id: string) {
    return this.tourService.getTourById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new tour package' })
  async createTour(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateTourDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.tourService.createTour(dto, user.organizationId || '', user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiOperation({ summary: 'Update tour package' })
  @ApiParam({ name: 'id', description: 'Tour UUID' })
  async updateTour(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateTourDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.tourService.updateTour(id, dto, user.organizationId || '', user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiOperation({ summary: 'Archive/delete tour' })
  @ApiParam({ name: 'id', description: 'Tour UUID' })
  async deleteTour(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.tourService.deleteTour(id, user.organizationId || '', user);
  }

  @Post('book')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book tour excursion' })
  async bookTour(
    @Body(new ValidationPipe({ whitelist: true })) dto: BookTourDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.tourService.bookTour(dto, user.userId);
  }
}
