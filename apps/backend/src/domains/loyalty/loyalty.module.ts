import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Domain Token
import { LOYALTY_REPOSITORY_TOKEN } from './domain/repositories/loyalty.repository.interface.js';

// Infrastructure Adapter
import { PrismaLoyaltyRepository } from './infrastructure/repositories/prisma-loyalty.repository.js';

// Application Services
import { WalletApplicationService } from './application/services/wallet.application-service.js';
import { LoyaltyProgramApplicationService } from './application/services/loyalty-program.application-service.js';
import { GiftCardApplicationService } from './application/services/giftcard.application-service.js';
import { ReferralApplicationService } from './application/services/referral.application-service.js';
import { CouponApplicationService } from './application/services/coupon.application-service.js';

// Presentation Controllers
import { WalletController } from './presentation/controllers/wallet.controller.js';
import { LoyaltyProgramController } from './presentation/controllers/loyalty.controller.js';
import { GiftCardController } from './presentation/controllers/giftcard.controller.js';
import { ReferralController } from './presentation/controllers/referral.controller.js';
import { CouponController } from './presentation/controllers/coupon.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    WalletController,
    LoyaltyProgramController,
    GiftCardController,
    ReferralController,
    CouponController,
  ],
  providers: [
    { provide: LOYALTY_REPOSITORY_TOKEN, useClass: PrismaLoyaltyRepository },
    WalletApplicationService,
    LoyaltyProgramApplicationService,
    GiftCardApplicationService,
    ReferralApplicationService,
    CouponApplicationService,
  ],
  exports: [
    WalletApplicationService,
    LoyaltyProgramApplicationService,
    GiftCardApplicationService,
    ReferralApplicationService,
    CouponApplicationService,
  ],
})
export class LoyaltyModule {}
