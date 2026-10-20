import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from '@omnistay/database';
import { RedisModule } from '@omnistay/infrastructure';
import { QueueModule } from '@omnistay/infrastructure';
import { AuthModule } from './domains/auth/auth.module.js';
import { HealthModule } from './domains/health/health.module.js';
import { OrganizationModule } from './domains/organization/organization.module.js';
import { UserModule } from './domains/user/user.module.js';
import { HotelModule } from './domains/hotel/hotel.module.js';
import { TravelModule } from './domains/travel/travel.module.js';
import { AccountingModule } from './domains/accounting/accounting.module.js';
import { PosModule } from './domains/pos/pos.module.js';
import { InventoryModule } from './domains/inventory/inventory.module.js';
import { CorrelationIdMiddleware } from '@omnistay/backend-common';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
    PrismaModule,
    RedisModule,
    QueueModule,
    AuthModule,
    HealthModule,
    OrganizationModule,
    UserModule,
    HotelModule,
    TravelModule,
    AccountingModule,
    PosModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
