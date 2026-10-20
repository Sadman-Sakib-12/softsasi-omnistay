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
import { RoomTypeService } from '../services/room-type.service.js';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from '../dto/create-room-type.dto.js';
import { CreateRoomBedDto } from '../dto/create-room-bed.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Room Types & Bed Configurations')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1')
export class RoomTypeController {
  constructor(private readonly roomTypeService: RoomTypeService) {}

  @Post('properties/:propertyId/room-types')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create room category',
    description: 'Registers a new room category (e.g. Deluxe Ocean Suite) under the property.',
  })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({ status: 201, description: 'Room category created successfully' })
  @ApiResponse({ status: 409, description: 'Slug conflict within property' })
  async createRoomType(
    @Param('propertyId') propertyId: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateRoomTypeDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomTypeService.createRoomType(propertyId, dto, user.organizationId || '', user);
  }

  @Get('properties/:propertyId/room-types')
  @ApiOperation({
    summary: 'List room categories for property',
    description: 'Retrieves all active room categories with bed configurations and room counts.',
  })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({ status: 200, description: 'List of room types' })
  async listRoomTypes(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomTypeService.listRoomTypes(propertyId, user.organizationId);
  }

  @Get('room-types/:id')
  @ApiOperation({
    summary: 'Get room category details',
    description: 'Fetches detailed room type specifications, beds, and physical unit assignments.',
  })
  @ApiParam({ name: 'id', description: 'RoomType UUID' })
  @ApiResponse({ status: 200, description: 'Room type specifications' })
  @ApiResponse({ status: 404, description: 'Room type not found' })
  async getRoomType(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomTypeService.getRoomTypeById(id, user.organizationId);
  }

  @Patch('room-types/:id')
  @ApiOperation({
    summary: 'Update room category',
    description: 'Updates category title, pricing, occupancy limits, or dimensions.',
  })
  @ApiParam({ name: 'id', description: 'RoomType UUID' })
  @ApiResponse({ status: 200, description: 'Room type updated successfully' })
  async updateRoomType(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateRoomTypeDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomTypeService.updateRoomType(id, dto, user.organizationId || '', user);
  }

  @Delete('room-types/:id')
  @ApiOperation({
    summary: 'Delete room category',
    description: 'Soft deletes room type and marks status as archived.',
  })
  @ApiParam({ name: 'id', description: 'RoomType UUID' })
  @ApiResponse({ status: 200, description: 'Room type archived successfully' })
  async deleteRoomType(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomTypeService.deleteRoomType(id, user.organizationId || '', user);
  }

  // --- Bed Matrix Endpoints ---

  @Post('room-types/:id/beds')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add bed to room category',
    description: 'Configures sleeping arrangement (King, Queen, Twin, Sofa bed) for the room type.',
  })
  @ApiParam({ name: 'id', description: 'RoomType UUID' })
  @ApiResponse({ status: 201, description: 'Bed configuration added' })
  async addBed(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateRoomBedDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomTypeService.addBed(id, dto, user.organizationId || '', user);
  }

  @Get('room-types/:id/beds')
  @ApiOperation({
    summary: 'List bed configurations',
    description: 'Retrieves all bed types and quantities configured for this room category.',
  })
  @ApiParam({ name: 'id', description: 'RoomType UUID' })
  @ApiResponse({ status: 200, description: 'List of configured beds' })
  async listBeds(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomTypeService.listBeds(id, user.organizationId);
  }

  @Delete('room-types/:id/beds/:bedId')
  @ApiOperation({
    summary: 'Remove bed configuration',
    description: 'Deletes a bed configuration record from the room type.',
  })
  @ApiParam({ name: 'id', description: 'RoomType UUID' })
  @ApiParam({ name: 'bedId', description: 'RoomBed UUID' })
  @ApiResponse({ status: 200, description: 'Bed configuration deleted' })
  async removeBed(
    @Param('id') id: string,
    @Param('bedId') bedId: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomTypeService.removeBed(id, bedId, user.organizationId || '', user);
  }
}
