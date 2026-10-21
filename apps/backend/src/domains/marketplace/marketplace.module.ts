import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Domain Token
import { MARKETPLACE_REPOSITORY_TOKEN } from './domain/repositories/marketplace.repository.interface.js';

// Infrastructure Adapter
import { PrismaMarketplaceRepository } from './infrastructure/repositories/prisma-marketplace.repository.js';

// Application Services
import { VendorApplicationService } from './application/services/vendor.application-service.js';
import { CommissionApplicationService } from './application/services/commission.application-service.js';
import { VendorPayoutApplicationService } from './application/services/vendor-payout.application-service.js';
import { GuestReviewApplicationService } from './application/services/guest-review.application-service.js';

// Presentation Controllers
import { VendorController } from './presentation/controllers/vendor.controller.js';
import { CommissionController } from './presentation/controllers/commission.controller.js';
import { VendorPayoutController } from './presentation/controllers/vendor-payout.controller.js';
import { GuestReviewController } from './presentation/controllers/guest-review.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    VendorController,
    CommissionController,
    VendorPayoutController,
    GuestReviewController,
  ],
  providers: [
    { provide: MARKETPLACE_REPOSITORY_TOKEN, useClass: PrismaMarketplaceRepository },
    VendorApplicationService,
    CommissionApplicationService,
    VendorPayoutApplicationService,
    GuestReviewApplicationService,
  ],
  exports: [
    VendorApplicationService,
    CommissionApplicationService,
    VendorPayoutApplicationService,
    GuestReviewApplicationService,
  ],
})
export class MarketplaceModule {}
