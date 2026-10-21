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
import { RoomService } from '../../application/services/room.service.js';
import { CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto } from '../dto/create-room.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Physical Rooms & Room Inventory')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('room-types/:roomTypeId/rooms')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create physical room unit',
    description: 'Registers a numbered room unit (e.g. 101, 102) under a specific room type.',
  })
  @ApiParam({ name: 'roomTypeId', description: 'RoomType UUID' })
  @ApiResponse({ status: 201, description: 'Room unit created successfully' })
  @ApiResponse({ status: 409, description: 'Room number duplicate' })
  async createRoom(
    @Param('roomTypeId') roomTypeId: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateRoomDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomService.createRoom(roomTypeId, dto, user.organizationId || '', user);
  }

  @Get('rooms')
  @ApiOperation({
    summary: 'List physical room units',
    description: 'Retrieves room units with filters for property, category, cleanliness, or operational status.',
  })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Filter by Property UUID' })
  @ApiQuery({ name: 'roomTypeId', required: false, description: 'Filter by RoomType UUID' })
  @ApiQuery({ name: 'cleanlinessStatus', required: false, description: 'clean, dirty, inspected, cleaning' })
  @ApiQuery({ name: 'operationalStatus', required: false, description: 'available, ooo, oos' })
  @ApiResponse({ status: 200, description: 'List of physical room units' })
  async listRooms(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('propertyId') propertyId?: string,
    @Query('roomTypeId') roomTypeId?: string,
    @Query('cleanlinessStatus') cleanlinessStatus?: string,
    @Query('operationalStatus') operationalStatus?: string,
  ) {
    return this.roomService.listRooms(
      { propertyId, roomTypeId, cleanlinessStatus, operationalStatus },
      user.organizationId,
    );
  }

  @Get('rooms/:id')
  @ApiOperation({
    summary: 'Get room details',
    description: 'Fetches room profile, bed arrangement, recent housekeeping history, and open work orders.',
  })
  @ApiParam({ name: 'id', description: 'Room UUID' })
  @ApiResponse({ status: 200, description: 'Room details' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async getRoom(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomService.getRoomById(id, user.organizationId);
  }

  @Patch('rooms/:id')
  @ApiOperation({
    summary: 'Update room specifications',
    description: 'Updates room number, building, floor, or electronic keycard code.',
  })
  @ApiParam({ name: 'id', description: 'Room UUID' })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  async updateRoom(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateRoomDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomService.updateRoom(id, dto, user.organizationId || '', user);
  }

  @Patch('rooms/:id/status')
  @ApiOperation({
    summary: 'Update room cleanliness or operational status',
    description: 'Transitions room status (e.g. Dirty -> Clean -> Inspected or Available -> OOO) and appends to audit log.',
  })
  @ApiParam({ name: 'id', description: 'Room UUID' })
  @ApiResponse({ status: 200, description: 'Room status updated and audit logged' })
  async updateRoomStatus(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateRoomStatusDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomService.updateRoomStatus(id, dto, user.organizationId || '', user);
  }

  @Delete('rooms/:id')
  @ApiOperation({
    summary: 'Delete room unit',
    description: 'Soft deletes room and flags operational status as out-of-service.',
  })
  @ApiParam({ name: 'id', description: 'Room UUID' })
  @ApiResponse({ status: 200, description: 'Room deleted' })
  async deleteRoom(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomService.deleteRoom(id, user.organizationId || '', user);
  }
}
