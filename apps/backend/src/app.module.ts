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
import { HrmModule } from './domains/hrm/hrm.module.js';
import { CrmModule } from './domains/crm/crm.module.js';
import { MarketplaceModule } from './domains/marketplace/marketplace.module.js';
import { LoyaltyModule } from './domains/loyalty/loyalty.module.js';
import { AiModule } from './domains/ai/ai.module.js';
import { CommunicationModule } from './domains/communication/communication.module.js';
import { IotModule } from './domains/iot/iot.module.js';
import { ProjectModule } from './domains/project/project.module.js';
import { PaymentModule } from './domains/payment/payment.module.js';
import { SystemModule } from './domains/system/system.module.js';
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
    HrmModule,
    CrmModule,
    MarketplaceModule,
    LoyaltyModule,
    AiModule,
    CommunicationModule,
    IotModule,
    ProjectModule,
    PaymentModule,
    SystemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
