import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';
import { WarehouseService } from './services/warehouse.service.js';
import { ProductCatalogService } from './services/product-catalog.service.js';
import { ProcurementService } from './services/procurement.service.js';
import { StockValuationService } from './services/stock-valuation.service.js';
import { WarehouseController } from './controllers/warehouse.controller.js';
import { ProductCatalogController } from './controllers/product-catalog.controller.js';
import { ProcurementController } from './controllers/procurement.controller.js';
import { StockValuationController } from './controllers/stock-valuation.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    WarehouseController,
    ProductCatalogController,
    ProcurementController,
    StockValuationController,
  ],
  providers: [
    WarehouseService,
    ProductCatalogService,
    ProcurementService,
    StockValuationService,
  ],
  exports: [
    WarehouseService,
    ProductCatalogService,
    ProcurementService,
    StockValuationService,
  ],
})
export class InventoryModule {}
