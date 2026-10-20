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
import { MaintenanceService } from '../services/maintenance.service.js';
import {
  CreateMaintenanceWorkOrderDto,
  UpdateMaintenanceWorkOrderStatusDto,
} from '../dto/maintenance.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Maintenance & Engineering Facilities')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post('work-orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Dispatch maintenance work order',
    description: 'Creates a repair ticket with SLA tracking. Automatically flags room Out-of-Order (OOO) for emergency repairs.',
  })
  @ApiResponse({ status: 201, description: 'Work order dispatched' })
  async createWorkOrder(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateMaintenanceWorkOrderDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.maintenanceService.createWorkOrder(dto, user.organizationId || '', user);
  }

  @Get('work-orders')
  @ApiOperation({
    summary: 'List maintenance work orders',
    description: 'Retrieves engineering tickets with SLA tracking, defect descriptions, and assigned technicians.',
  })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Property UUID' })
  @ApiQuery({ name: 'status', required: false, description: 'open, in_progress, resolved, closed' })
  @ApiQuery({ name: 'priority', required: false, description: 'emergency, high, routine' })
  @ApiQuery({ name: 'roomId', required: false, description: 'Room UUID' })
  @ApiResponse({ status: 200, description: 'List of work orders' })
  async listWorkOrders(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('roomId') roomId?: string,
  ) {
    return this.maintenanceService.listWorkOrders(
      { propertyId, status, priority, roomId },
      user.organizationId || '',
    );
  }

  @Patch('work-orders/:id/status')
  @ApiOperation({
    summary: 'Update work order progress & resolve ticket',
    description: 'Updates repair status and automatically unblocks room back to Available status upon completion.',
  })
  @ApiParam({ name: 'id', description: 'MaintenanceWorkOrder UUID' })
  @ApiResponse({ status: 200, description: 'Work order updated' })
  async updateWorkOrderStatus(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateMaintenanceWorkOrderStatusDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.maintenanceService.updateWorkOrderStatus(id, dto, user.organizationId || '', user);
  }
}
