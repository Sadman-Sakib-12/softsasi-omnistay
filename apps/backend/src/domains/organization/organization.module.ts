import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Repositories
import { ORGANIZATION_REPOSITORY_TOKEN } from './domain/repositories/organization.repository.interface.js';
import { PrismaOrganizationRepository } from './infrastructure/repositories/prisma-organization.repository.js';

// Controllers
import { OrganizationController } from './presentation/controllers/organization.controller.js';
import { SaasBillingController } from './presentation/controllers/saas-billing.controller.js';
import { ComplianceController } from './presentation/controllers/compliance.controller.js';

// Services
import { OrganizationService } from './application/services/organization.service.js';
import { SaasBillingService } from './application/services/saas-billing.service.js';
import { ComplianceService } from './application/services/compliance.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationController, SaasBillingController, ComplianceController],
  providers: [
    {
      provide: ORGANIZATION_REPOSITORY_TOKEN,
      useClass: PrismaOrganizationRepository,
    },
    PrismaOrganizationRepository,
    OrganizationService,
    SaasBillingService,
    ComplianceService,
  ],
  exports: [
    ORGANIZATION_REPOSITORY_TOKEN,
    PrismaOrganizationRepository,
    OrganizationService,
    SaasBillingService,
    ComplianceService,
  ],
})
export class OrganizationModule {}
