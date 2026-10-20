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
import { CarService } from '../services/car.service.js';
import { BookCarDto, CreateCarDto, UpdateCarDto } from '../dto/car.dto.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUserPayload } from '../../../common/decorators/current-user.decorator.js';

@ApiTags('Car Rentals & Fleet')
@Controller('api/v1/cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get()
  @ApiOperation({ summary: 'List fleet cars', description: 'Lists rental cars, specifications, and daily rates.' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'transmission', required: false })
  async listCars(
    @Query('category') category?: string,
    @Query('transmission') transmission?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.carService.listCars(tenantId, { category, transmission });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get car by ID' })
  @ApiParam({ name: 'id', description: 'Car UUID' })
  async getCar(@Param('id') id: string) {
    return this.carService.getCarById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new fleet vehicle' })
  async createCar(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateCarDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.carService.createCar(dto, user.organizationId || '', user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiOperation({ summary: 'Update vehicle specifications' })
  @ApiParam({ name: 'id', description: 'Car UUID' })
  async updateCar(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateCarDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.carService.updateCar(id, dto, user.organizationId || '', user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiOperation({ summary: 'Delete/archive vehicle' })
  @ApiParam({ name: 'id', description: 'Car UUID' })
  async deleteCar(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.carService.deleteCar(id, user.organizationId || '', user);
  }

  @Post('book')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book rental vehicle' })
  async bookCar(
    @Body(new ValidationPipe({ whitelist: true })) dto: BookCarDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.carService.bookCar(dto, user.userId);
  }
}
