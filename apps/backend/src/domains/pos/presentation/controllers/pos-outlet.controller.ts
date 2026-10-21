import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { PosOutletApplicationService } from '../../application/services/pos-outlet.application-service.js';
import {
  CreateDiningTableDto,
  CreatePosOutletDto,
  MergeTablesDto,
  TransferTableDto,
  UpdateTablePositionDto,
} from '../dto/pos-outlet.dto.js';

@ApiTags('POS - Outlets & Table Floor Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/pos/outlets')
export class PosOutletController {
  constructor(private readonly outletService: PosOutletApplicationService) {}

  @Post()
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'F&B Director')
  @ApiOperation({ summary: 'Create new POS outlet (restaurant, bar, spa, gift shop)' })
  createOutlet(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreatePosOutletDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.outletService.createOutlet(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all POS outlets for tenant' })
  getOutlets(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.outletService.getOutlets(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get outlet details with visual tables and menus' })
  getOutletById(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('id') id: string,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.outletService.getOutletById(tenantId, id);
  }

  @Post(':id/tables')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'F&B Director', 'Restaurant Captain')
  @ApiOperation({ summary: 'Add dining table to outlet floor plan' })
  createTable(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('id') outletId: string,
    @Body() dto: CreateDiningTableDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.outletService.createTable(tenantId, outletId, dto);
  }

  @Patch('tables/:tableId/position')
  @ApiOperation({ summary: 'Update table canvas coordinates (posX, posY) on floor plan' })
  updateTablePosition(
    @Param('tableId') tableId: string,
    @Body() dto: UpdateTablePositionDto,
  ) {
    return this.outletService.updateTablePosition(tableId, dto);
  }

  @Patch('tables/:tableId/status/:status')
  @ApiOperation({ summary: 'Update dining table state (vacant, seated, cooking, dining, check_printed, cleaning)' })
  updateTableStatus(
    @Param('tableId') tableId: string,
    @Param('status') status: string,
  ) {
    return this.outletService.updateTableStatus(tableId, status);
  }

  @Post('tables/transfer')
  @ApiOperation({ summary: 'Transfer active party and orders from one table to another' })
  transferTable(@Body() dto: TransferTableDto) {
    return this.outletService.transferTable(dto);
  }

  @Post('tables/merge')
  @ApiOperation({ summary: 'Merge multiple dining tables for large banquet parties' })
  mergeTables(@Body() dto: MergeTablesDto) {
    return this.outletService.mergeTables(dto);
  }
}
