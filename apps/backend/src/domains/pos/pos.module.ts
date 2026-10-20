import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';
import { PosOutletService } from './services/pos-outlet.service.js';
import { PosMenuService } from './services/pos-menu.service.js';
import { PosOrderService } from './services/pos-order.service.js';
import { KdsService } from './services/kds.service.js';
import { PosRoomChargeService } from './services/pos-room-charge.service.js';
import { PosShiftService } from './services/pos-shift.service.js';
import { PosOutletController } from './controllers/pos-outlet.controller.js';
import { PosMenuController } from './controllers/pos-menu.controller.js';
import { PosOrderController } from './controllers/pos-order.controller.js';
import { KdsController } from './controllers/kds.controller.js';
import { PosRoomChargeController } from './controllers/pos-room-charge.controller.js';
import { PosShiftController } from './controllers/pos-shift.controller.js';

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
    PosOutletService,
    PosMenuService,
    PosOrderService,
    KdsService,
    PosRoomChargeService,
    PosShiftService,
  ],
  exports: [
    PosOutletService,
    PosMenuService,
    PosOrderService,
    KdsService,
    PosRoomChargeService,
    PosShiftService,
  ],
})
export class PosModule {}
