import { Module } from '@nestjs/common';
import { HotelController } from './controllers/hotel.controller.js';
import { HotelService } from './services/hotel.service.js';
import { PrismaModule } from '@omnistay/database';

@Module({
  imports: [PrismaModule],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule { }

export const HotelsModule = HotelModule;
