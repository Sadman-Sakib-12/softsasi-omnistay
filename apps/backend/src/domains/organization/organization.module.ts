import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Repositories
import { ORGANIZATION_REPOSITORY_TOKEN } from './domain/repositories/organization.repository.interface.js';
import { PrismaOrganizationRepository } from './infrastructure/repositories/prisma-organization.repository.js';

// Controllers
import { OrganizationController } from './presentation/controllers/organization.controller.js';

// Services
import { OrganizationService } from './application/services/organization.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationController],
  providers: [
    {
      provide: ORGANIZATION_REPOSITORY_TOKEN,
      useClass: PrismaOrganizationRepository,
    },
    PrismaOrganizationRepository,
    OrganizationService,
  ],
  exports: [
    ORGANIZATION_REPOSITORY_TOKEN,
    PrismaOrganizationRepository,
    OrganizationService,
  ],
})
export class OrganizationModule {}
