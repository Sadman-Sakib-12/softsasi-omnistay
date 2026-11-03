import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';
import { SystemContentController } from './system-content.controller.js';
import { SystemContentService } from './system-content.service.js';
import { WebhookController } from './presentation/controllers/webhook.controller.js';
import { WebhookDispatcherService } from './application/services/webhook-dispatcher.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [SystemContentController, WebhookController],
  providers: [SystemContentService, WebhookDispatcherService],
  exports: [SystemContentService, WebhookDispatcherService],
})
export class SystemModule {}
