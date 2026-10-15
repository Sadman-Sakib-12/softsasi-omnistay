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
import { HotelService } from '../services/hotel.service.js';
import { CreateHotelDto } from '../dto/create-hotel.dto.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUserPayload } from '../../../common/decorators/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/properties')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Get()
  async listProperties(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('organizationId') queryOrgId?: string,
  ) {
    const orgId = queryOrgId || user.organizationId;
    return this.hotelService.listProperties(orgId, user);
  }

  @Get(':id')
  async getProperty(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.hotelService.getPropertyById(id, user.organizationId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProperty(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateHotelDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.hotelService.createProperty(dto, user.organizationId || '', user);
  }
}

export const HotelsController = HotelController;
