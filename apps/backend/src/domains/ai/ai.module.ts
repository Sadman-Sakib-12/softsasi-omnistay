import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Domain Token & Infrastructure Adapter
import { AI_REPOSITORY_TOKEN } from './domain/repositories/ai.repository.interface.js';
import { PrismaAiRepository } from './infrastructure/repositories/prisma-ai.repository.js';

// Application Services
import { AiConciergeService } from './application/services/ai-concierge.service.js';
import { InChatBookingService } from './application/services/in-chat-booking.service.js';
import { DynamicYieldPricingService } from './application/services/dynamic-pricing.service.js';
import { AiMarketingStudioService } from './application/services/ai-marketing.service.js';
import { AiPredictiveAnalyticsService } from './application/services/ai-predictive.service.js';

// Presentation Controllers
import { AiConciergeController } from './presentation/controllers/ai-concierge.controller.js';
import { InChatBookingController } from './presentation/controllers/in-chat-booking.controller.js';
import { DynamicPricingController } from './presentation/controllers/dynamic-pricing.controller.js';
import { AiMarketingController } from './presentation/controllers/ai-marketing.controller.js';
import { AiPredictiveController } from './presentation/controllers/ai-predictive.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    AiConciergeController,
    InChatBookingController,
    DynamicPricingController,
    AiMarketingController,
    AiPredictiveController,
  ],
  providers: [
    { provide: AI_REPOSITORY_TOKEN, useClass: PrismaAiRepository },
    AiConciergeService,
    InChatBookingService,
    DynamicYieldPricingService,
    AiMarketingStudioService,
    AiPredictiveAnalyticsService,
  ],
  exports: [
    AiConciergeService,
    InChatBookingService,
    DynamicYieldPricingService,
    AiMarketingStudioService,
    AiPredictiveAnalyticsService,
  ],
})
export class AiModule {}
