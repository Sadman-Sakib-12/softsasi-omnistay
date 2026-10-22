import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Domain Token & Infrastructure Adapter
import { COMMUNICATION_REPOSITORY_TOKEN } from './domain/repositories/communication.repository.interface.js';
import { PrismaCommunicationRepository } from './infrastructure/repositories/prisma-communication.repository.js';

// Application Services
import { ChatService } from './application/services/chat.service.js';
import { WhatsappService } from './application/services/whatsapp.service.js';
import { SmsGatewayService } from './application/services/sms-gateway.service.js';
import { EmailTemplateService } from './application/services/email-template.service.js';
import { PushNotificationService } from './application/services/push-notification.service.js';

// Presentation Controllers
import { ChatController } from './presentation/controllers/chat.controller.js';
import { WhatsappController } from './presentation/controllers/whatsapp.controller.js';
import { SmsController } from './presentation/controllers/sms.controller.js';
import { EmailTemplateController } from './presentation/controllers/email-template.controller.js';
import { PushNotificationController } from './presentation/controllers/push-notification.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    ChatController,
    WhatsappController,
    SmsController,
    EmailTemplateController,
    PushNotificationController,
  ],
  providers: [
    { provide: COMMUNICATION_REPOSITORY_TOKEN, useClass: PrismaCommunicationRepository },
    ChatService,
    WhatsappService,
    SmsGatewayService,
    EmailTemplateService,
    PushNotificationService,
  ],
  exports: [
    ChatService,
    WhatsappService,
    SmsGatewayService,
    EmailTemplateService,
    PushNotificationService,
  ],
})
export class CommunicationModule {}
