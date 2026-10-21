import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { ProcurementApplicationService } from '../../application/services/procurement.application-service.js';
import { CreateGoodsReceivedNoteDto, CreatePurchaseOrderDto, ThreeWayMatchDto } from '../dto/procurement.dto.js';

@ApiTags('Supply Chain - Procurement & 3-Way Matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/inventory/procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementApplicationService) {}

  @Post('orders')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'Purchasing Manager', 'Executive Chef')
  @ApiOperation({ summary: 'Create official vendor Purchase Order (PO)' })
  createPurchaseOrder(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreatePurchaseOrderDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.procurementService.createPurchaseOrder(tenantId, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List all Purchase Orders with GRN statuses' })
  getPurchaseOrders(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.procurementService.getPurchaseOrders(tenantId);
  }

  @Post('grn')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'Warehouse Supervisor', 'Receiving Clerk')
  @ApiQuery({ name: 'warehouseId', required: false, description: 'Optional warehouse to auto-receive inventory stock into' })
  @ApiOperation({ summary: 'Inspect and log Goods Received Note (GRN) with damaged delivery tracking' })
  receiveGoods(
    @Body() dto: CreateGoodsReceivedNoteDto,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.procurementService.receiveGoods(dto, warehouseId);
  }

  @Post('three-way-match')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'Financial Accountant', 'Purchasing Manager')
  @ApiOperation({ summary: 'Perform 3-Way Match validation (PO Quantity/Price vs GRN Received vs Vendor Bill)' })
  executeThreeWayMatch(@Body() dto: ThreeWayMatchDto) {
    return this.procurementService.executeThreeWayMatch(dto);
  }
}
