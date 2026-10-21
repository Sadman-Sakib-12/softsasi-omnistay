import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';
import { HOTEL_REPOSITORY_TOKEN } from './domain/repositories/hotel.repository.interface.js';
import { PrismaHotelRepository } from './infrastructure/repositories/prisma-hotel.repository.js';

// Controllers
import { HotelController } from './presentation/controllers/hotel.controller.js';
import { RoomTypeController } from './presentation/controllers/room-type.controller.js';
import { RoomController } from './presentation/controllers/room.controller.js';
import { RateCalendarController } from './presentation/controllers/rate-calendar.controller.js';
import { TapeChartController } from './presentation/controllers/tape-chart.controller.js';
import { BookingController } from './presentation/controllers/booking.controller.js';
import { FolioController } from './presentation/controllers/folio.controller.js';
import { HousekeepingController } from './presentation/controllers/housekeeping.controller.js';
import { MaintenanceController } from './presentation/controllers/maintenance.controller.js';
import { IcalController } from './presentation/controllers/ical.controller.js';

// Services
import { HotelService } from './application/services/hotel.service.js';
import { RoomTypeService } from './application/services/room-type.service.js';
import { RoomService } from './application/services/room.service.js';
import { RateCalendarService } from './application/services/rate-calendar.service.js';
import { TapeChartService } from './application/services/tape-chart.service.js';
import { BookingService } from './application/services/booking.service.js';
import { FolioService } from './application/services/folio.service.js';
import { HousekeepingService } from './application/services/housekeeping.service.js';
import { MaintenanceService } from './application/services/maintenance.service.js';
import { IcalService } from './application/services/ical.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    HotelController,
    RoomTypeController,
    RoomController,
    RateCalendarController,
    TapeChartController,
    BookingController,
    FolioController,
    HousekeepingController,
    MaintenanceController,
    IcalController,
  ],
  providers: [
    {
      provide: HOTEL_REPOSITORY_TOKEN,
      useClass: PrismaHotelRepository,
    },
    HotelService,
    RoomTypeService,
    RoomService,
    RateCalendarService,
    TapeChartService,
    BookingService,
    FolioService,
    HousekeepingService,
    MaintenanceService,
    IcalService,
  ],
  exports: [
    HOTEL_REPOSITORY_TOKEN,
    HotelService,
    RoomTypeService,
    RoomService,
    RateCalendarService,
    TapeChartService,
    BookingService,
    FolioService,
    HousekeepingService,
    MaintenanceService,
    IcalService,
  ],
})
export class HotelModule {}

export const HotelsModule = HotelModule;
