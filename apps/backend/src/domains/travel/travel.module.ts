import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Repositories
import { TRAVEL_REPOSITORY_TOKEN } from './domain/repositories/travel.repository.interface.js';
import { PrismaTravelRepository } from './infrastructure/repositories/prisma-travel.repository.js';

// Controllers
import { SpaceController } from './presentation/controllers/space.controller.js';
import { TourController } from './presentation/controllers/tour.controller.js';
import { CarController } from './presentation/controllers/car.controller.js';
import { BoatController } from './presentation/controllers/boat.controller.js';
import { EventController } from './presentation/controllers/event.controller.js';
import { FlightController } from './presentation/controllers/flight.controller.js';
import { CartController } from './presentation/controllers/cart.controller.js';

// Services
import { SpaceService } from './application/services/space.service.js';
import { TourService } from './application/services/tour.service.js';
import { CarService } from './application/services/car.service.js';
import { BoatService } from './application/services/boat.service.js';
import { EventService } from './application/services/event.service.js';
import { FlightService } from './application/services/flight.service.js';
import { CartService } from './application/services/cart.service.js';

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
    {
      provide: TRAVEL_REPOSITORY_TOKEN,
      useClass: PrismaTravelRepository,
    },
    PrismaTravelRepository,
    SpaceService,
    TourService,
    CarService,
    BoatService,
    EventService,
    FlightService,
    CartService,
  ],
  exports: [
    TRAVEL_REPOSITORY_TOKEN,
    PrismaTravelRepository,
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
