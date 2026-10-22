import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Domain Token & Repo
import { IOT_REPOSITORY_TOKEN } from './domain/repositories/iot.repository.interface.js';
import { PrismaIotRepository } from './infrastructure/repositories/prisma-iot.repository.js';

// Services
import { SmartLockService } from './application/services/smart-lock.service.js';
import { ThermostatService } from './application/services/thermostat.service.js';
import { RoomQrService } from './application/services/room-qr.service.js';
import { ContactlessCheckInService } from './application/services/contactless-checkin.service.js';

// Controllers
import { SmartLockController } from './presentation/controllers/smart-lock.controller.js';
import { ThermostatController } from './presentation/controllers/thermostat.controller.js';
import { RoomQrController } from './presentation/controllers/room-qr.controller.js';
import { ContactlessController } from './presentation/controllers/contactless.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    SmartLockController,
    ThermostatController,
    RoomQrController,
    ContactlessController,
  ],
  providers: [
    { provide: IOT_REPOSITORY_TOKEN, useClass: PrismaIotRepository },
    SmartLockService,
    ThermostatService,
    RoomQrService,
    ContactlessCheckInService,
  ],
  exports: [
    SmartLockService,
    ThermostatService,
    RoomQrService,
    ContactlessCheckInService,
  ],
})
export class IotModule {}
