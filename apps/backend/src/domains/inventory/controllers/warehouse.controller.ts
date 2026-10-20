import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { WarehouseService } from '../services/warehouse.service.js';
import { CreateWarehouseBinDto, CreateWarehouseDto, InitiateStockTransferDto } from '../dto/warehouse.dto.js';

@ApiTags('Supply Chain - Multi-Warehouse Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/inventory/warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'Purchasing Manager')
  @ApiOperation({ summary: 'Create new warehouse storage location (central, kitchen, cellar, linen store)' })
  createWarehouse(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateWarehouseDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.warehouseService.createWarehouse(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all property warehouses with real-time stock levels' })
  getWarehouses(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.warehouseService.getWarehouses(tenantId);
  }

  @Post(':warehouseId/bins')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'Warehouse Supervisor')
  @ApiOperation({ summary: 'Add storage bin or zone to warehouse' })
  createBin(
    @Param('warehouseId') warehouseId: string,
    @Body() dto: CreateWarehouseBinDto,
  ) {
    return this.warehouseService.createBin(warehouseId, dto);
  }

  @Get(':warehouseId/products/:productId/stock')
  @ApiOperation({ summary: 'Get current stock balance for a product in warehouse' })
  getStockLevel(
    @Param('warehouseId') warehouseId: string,
    @Param('productId') productId: string,
  ) {
    return this.warehouseService.getStockLevel(warehouseId, productId);
  }

  @Post('transfers')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'F&B Director', 'Warehouse Supervisor')
  @ApiOperation({ summary: 'Execute internal stock transfer between warehouses (e.g. 50 wine bottles from cellar to rooftop bar)' })
  initiateStockTransfer(@Body() dto: InitiateStockTransferDto) {
    return this.warehouseService.initiateStockTransfer(dto);
  }
}
