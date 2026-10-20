import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { StockValuationService } from '../services/stock-valuation.service.js';
import { PhysicalStocktakeAdjustmentDto, RecordWastageDto } from '../dto/stock-audit.dto.js';

@ApiTags('Supply Chain - Stock Valuation & Audits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/inventory/valuation')
export class StockValuationController {
  constructor(private readonly valuationService: StockValuationService) {}

  @Get('warehouse/:warehouseId')
  @ApiQuery({ name: 'method', enum: ['FIFO', 'WAC'], required: false, description: 'Valuation method (FIFO or WAC)' })
  @ApiOperation({ summary: 'Compute real-time inventory asset valuation (FIFO / Moving Weighted Average Cost)' })
  calculateInventoryValuation(
    @Param('warehouseId') warehouseId: string,
    @Query('method') method: 'FIFO' | 'WAC' = 'FIFO',
  ) {
    return this.valuationService.calculateInventoryValuation(warehouseId, method);
  }

  @Post('wastage/:warehouseId')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'F&B Director', 'Executive Chef')
  @ApiOperation({ summary: 'Write off expired food spoilage or broken stock and post to OPEX 6200' })
  recordWastage(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('warehouseId') warehouseId: string,
    @Body() dto: RecordWastageDto,
  ) {
    return this.valuationService.recordWastage(warehouseId, dto, user.userId);
  }

  @Get('alerts/reorder-thresholds')
  @ApiOperation({ summary: 'Scan all property warehouses and return automated low-stock reorder alerts' })
  checkReorderThresholds(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.valuationService.checkReorderThresholds(tenantId);
  }

  @Post('stocktake/reconcile')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'Financial Accountant', 'Warehouse Supervisor')
  @ApiOperation({ summary: 'Post physical count reconciliation and adjust book stock' })
  reconcilePhysicalStocktake(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: PhysicalStocktakeAdjustmentDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.valuationService.reconcilePhysicalStocktake(tenantId, dto);
  }
}
