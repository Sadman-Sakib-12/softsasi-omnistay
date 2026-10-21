import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';
import { INVENTORY_REPOSITORY_TOKEN } from './domain/repositories/inventory.repository.interface.js';
import { PrismaInventoryRepository } from './infrastructure/repositories/prisma-inventory.repository.js';
import { WarehouseApplicationService } from './application/services/warehouse.application-service.js';
import { ProductCatalogApplicationService } from './application/services/product-catalog.application-service.js';
import { ProcurementApplicationService } from './application/services/procurement.application-service.js';
import { StockValuationApplicationService } from './application/services/stock-valuation.application-service.js';
import { WarehouseController } from './presentation/controllers/warehouse.controller.js';
import { ProductCatalogController } from './presentation/controllers/product-catalog.controller.js';
import { ProcurementController } from './presentation/controllers/procurement.controller.js';
import { StockValuationController } from './presentation/controllers/stock-valuation.controller.js';

// Backward compatibility aliases
export const WarehouseService = WarehouseApplicationService;
export const ProductCatalogService = ProductCatalogApplicationService;
export const ProcurementService = ProcurementApplicationService;
export const StockValuationService = StockValuationApplicationService;

@Module({
  imports: [PrismaModule],
  controllers: [
    WarehouseController,
    ProductCatalogController,
    ProcurementController,
    StockValuationController,
  ],
  providers: [
    {
      provide: INVENTORY_REPOSITORY_TOKEN,
      useClass: PrismaInventoryRepository,
    },
    WarehouseApplicationService,
    ProductCatalogApplicationService,
    ProcurementApplicationService,
    StockValuationApplicationService,
  ],
  exports: [
    INVENTORY_REPOSITORY_TOKEN,
    WarehouseApplicationService,
    ProductCatalogApplicationService,
    ProcurementApplicationService,
    StockValuationApplicationService,
  ],
})
export class InventoryModule {}
