import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Domain Repository Tokens
import { LEAD_REPOSITORY_TOKEN } from './domain/repositories/lead.repository.interface.js';
import { DEAL_REPOSITORY_TOKEN } from './domain/repositories/deal.repository.interface.js';
import { FORM_REPOSITORY_TOKEN } from './domain/repositories/form.repository.interface.js';
import { GUEST360_REPOSITORY_TOKEN } from './domain/repositories/guest360.repository.interface.js';
import { SUPPORT_REPOSITORY_TOKEN } from './domain/repositories/support.repository.interface.js';

// Infrastructure Adapters
import { PrismaLeadRepository } from './infrastructure/repositories/prisma-lead.repository.js';
import { PrismaDealRepository } from './infrastructure/repositories/prisma-deal.repository.js';
import { PrismaFormRepository } from './infrastructure/repositories/prisma-form.repository.js';
import { PrismaGuest360Repository } from './infrastructure/repositories/prisma-guest360.repository.js';
import { PrismaSupportRepository } from './infrastructure/repositories/prisma-support.repository.js';

// Application Services
import { LeadApplicationService } from './application/services/lead.application-service.js';
import { DealApplicationService } from './application/services/deal.application-service.js';
import { FormApplicationService } from './application/services/form.application-service.js';
import { Guest360ApplicationService } from './application/services/guest360.application-service.js';
import { SupportApplicationService } from './application/services/support.application-service.js';

// Presentation Controllers
import { LeadController } from './presentation/controllers/lead.controller.js';
import { DealController } from './presentation/controllers/deal.controller.js';
import { FormBuilderController } from './presentation/controllers/form.controller.js';
import { Guest360Controller } from './presentation/controllers/guest360.controller.js';
import { SupportTicketController } from './presentation/controllers/support.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    LeadController,
    DealController,
    FormBuilderController,
    Guest360Controller,
    SupportTicketController,
  ],
  providers: [
    // Repository Providers
    { provide: LEAD_REPOSITORY_TOKEN, useClass: PrismaLeadRepository },
    { provide: DEAL_REPOSITORY_TOKEN, useClass: PrismaDealRepository },
    { provide: FORM_REPOSITORY_TOKEN, useClass: PrismaFormRepository },
    { provide: GUEST360_REPOSITORY_TOKEN, useClass: PrismaGuest360Repository },
    { provide: SUPPORT_REPOSITORY_TOKEN, useClass: PrismaSupportRepository },

    // Application Services
    LeadApplicationService,
    DealApplicationService,
    FormApplicationService,
    Guest360ApplicationService,
    SupportApplicationService,
  ],
  exports: [
    LeadApplicationService,
    DealApplicationService,
    FormApplicationService,
    Guest360ApplicationService,
    SupportApplicationService,
  ],
})
export class CrmModule {}
