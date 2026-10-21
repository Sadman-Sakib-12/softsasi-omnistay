import {
  Body,
  Controller,
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
import { HousekeepingService } from '../../application/services/housekeeping.service.js';
import { RoomService } from '../../application/services/room.service.js';
import {
  CreateHousekeepingTaskDto,
  UpdateHousekeepingTaskStatusDto,
} from '../dto/housekeeping.dto.js';
import { UpdateRoomStatusDto } from '../dto/create-room.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Housekeeping & Room Cleanliness Operations')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/housekeeping')
export class HousekeepingController {
  constructor(
    private readonly housekeepingService: HousekeepingService,
    private readonly roomService: RoomService,
  ) {}

  @Get('tasks')
  @ApiOperation({
    summary: 'Get assigned housekeeping tasks queue',
    description: 'Returns active cleaning task queue with priority tags, room numbers, and floor locations.',
  })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Property UUID' })
  @ApiQuery({ name: 'status', required: false, description: 'assigned, in_progress, completed, verified' })
  @ApiQuery({ name: 'priority', required: false, description: 'high, normal' })
  @ApiQuery({ name: 'housekeeperId', required: false, description: 'Filter by specific housekeeper user' })
  @ApiResponse({ status: 200, description: 'Task queue returned successfully' })
  async listTasks(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('housekeeperId') housekeeperId?: string,
  ) {
    return this.housekeepingService.listTasks(
      { propertyId, status, priority, housekeeperId },
      user.organizationId || '',
      user,
    );
  }

  @Post('tasks')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Dispatch housekeeping task',
    description: 'Creates a room cleaning assignment (checkout clean, stayover clean, deep clean, inspection).',
  })
  @ApiResponse({ status: 201, description: 'Housekeeping task assigned' })
  async createTask(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateHousekeepingTaskDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.housekeepingService.createTask(dto, user.organizationId || '', user);
  }

  @Patch('tasks/:id/status')
  @ApiOperation({
    summary: 'Update housekeeping task progress',
    description: 'Transitions task status (assigned -> in_progress -> completed -> verified) and auto-updates room cleanliness.',
  })
  @ApiParam({ name: 'id', description: 'HousekeepingTask UUID' })
  @ApiResponse({ status: 200, description: 'Task progress updated' })
  async updateTaskStatus(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateHousekeepingTaskStatusDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.housekeepingService.updateTaskStatus(id, dto, user.organizationId || '', user);
  }

  @Patch('status')
  @ApiOperation({
    summary: 'Transition room cleanliness status',
    description: 'Directly transitions room status (e.g. Dirty -> Clean -> Inspected) as specified in OpenAPI 3.1 Chapter 20.',
  })
  @ApiQuery({ name: 'roomId', required: true, description: 'Room UUID' })
  @ApiResponse({ status: 200, description: 'Room cleanliness status updated' })
  async transitionRoomStatus(
    @Query('roomId') roomId: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateRoomStatusDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.roomService.updateRoomStatus(roomId, dto, user.organizationId || '', user);
  }
}
