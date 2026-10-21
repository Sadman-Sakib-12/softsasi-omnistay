import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';
import { POS_REPOSITORY_TOKEN } from './domain/repositories/pos.repository.interface.js';
import { PrismaPosRepository } from './infrastructure/repositories/prisma-pos.repository.js';
import { PosOutletApplicationService } from './application/services/pos-outlet.application-service.js';
import { PosMenuApplicationService } from './application/services/pos-menu.application-service.js';
import { PosOrderApplicationService } from './application/services/pos-order.application-service.js';
import { KdsApplicationService } from './application/services/kds.application-service.js';
import { PosRoomChargeApplicationService } from './application/services/pos-room-charge.application-service.js';
import { PosShiftApplicationService } from './application/services/pos-shift.application-service.js';
import { PosOutletController } from './presentation/controllers/pos-outlet.controller.js';
import { PosMenuController } from './presentation/controllers/pos-menu.controller.js';
import { PosOrderController } from './presentation/controllers/pos-order.controller.js';
import { KdsController } from './presentation/controllers/kds.controller.js';
import { PosRoomChargeController } from './presentation/controllers/pos-room-charge.controller.js';
import { PosShiftController } from './presentation/controllers/pos-shift.controller.js';

// Backward compatibility aliases
export const PosOutletService = PosOutletApplicationService;
export const PosMenuService = PosMenuApplicationService;
export const PosOrderService = PosOrderApplicationService;
export const KdsService = KdsApplicationService;
export const PosRoomChargeService = PosRoomChargeApplicationService;
export const PosShiftService = PosShiftApplicationService;

@Module({
  imports: [PrismaModule],
  controllers: [
    PosOutletController,
    PosMenuController,
    PosOrderController,
    KdsController,
    PosRoomChargeController,
    PosShiftController,
  ],
  providers: [
    {
      provide: POS_REPOSITORY_TOKEN,
      useClass: PrismaPosRepository,
    },
    PosOutletApplicationService,
    PosMenuApplicationService,
    PosOrderApplicationService,
    KdsApplicationService,
    PosRoomChargeApplicationService,
    PosShiftApplicationService,
  ],
  exports: [
    POS_REPOSITORY_TOKEN,
    PosOutletApplicationService,
    PosMenuApplicationService,
    PosOrderApplicationService,
    KdsApplicationService,
    PosRoomChargeApplicationService,
    PosShiftApplicationService,
  ],
})
export class PosModule {}
