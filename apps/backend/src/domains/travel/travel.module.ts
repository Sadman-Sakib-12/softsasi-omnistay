import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Controllers
import { SpaceController } from './controllers/space.controller.js';
import { TourController } from './controllers/tour.controller.js';
import { CarController } from './controllers/car.controller.js';
import { BoatController } from './controllers/boat.controller.js';
import { EventController } from './controllers/event.controller.js';
import { FlightController } from './controllers/flight.controller.js';
import { CartController } from './controllers/cart.controller.js';

// Services
import { SpaceService } from './services/space.service.js';
import { TourService } from './services/tour.service.js';
import { CarService } from './services/car.service.js';
import { BoatService } from './services/boat.service.js';
import { EventService } from './services/event.service.js';
import { FlightService } from './services/flight.service.js';
import { CartService } from './services/cart.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    SpaceController,
    TourController,
    CarController,
    BoatController,
    EventController,
    FlightController,
    CartController,
  ],
  providers: [
    SpaceService,
    TourService,
    CarService,
    BoatService,
    EventService,
    FlightService,
    CartService,
  ],
  exports: [
    SpaceService,
    TourService,
    CarService,
    BoatService,
    EventService,
    FlightService,
    CartService,
  ],
})
export class TravelModule {}

export const TravelVerticalsModule = TravelModule;
