import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Controllers
import { HotelController } from './controllers/hotel.controller.js';
import { RoomTypeController } from './controllers/room-type.controller.js';
import { RoomController } from './controllers/room.controller.js';
import { RateCalendarController } from './controllers/rate-calendar.controller.js';
import { TapeChartController } from './controllers/tape-chart.controller.js';
import { BookingController } from './controllers/booking.controller.js';
import { FolioController } from './controllers/folio.controller.js';
import { HousekeepingController } from './controllers/housekeeping.controller.js';
import { MaintenanceController } from './controllers/maintenance.controller.js';
import { IcalController } from './controllers/ical.controller.js';

// Services
import { HotelService } from './services/hotel.service.js';
import { RoomTypeService } from './services/room-type.service.js';
import { RoomService } from './services/room.service.js';
import { RateCalendarService } from './services/rate-calendar.service.js';
import { TapeChartService } from './services/tape-chart.service.js';
import { BookingService } from './services/booking.service.js';
import { FolioService } from './services/folio.service.js';
import { HousekeepingService } from './services/housekeeping.service.js';
import { MaintenanceService } from './services/maintenance.service.js';
import { IcalService } from './services/ical.service.js';

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
