import { Module } from '@nestjs/common';
import { OrganizationController } from './controllers/organization.controller.js';
import { OrganizationService } from './services/organization.service.js';
import { PrismaModule } from '../../infrastructure/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}

export const OrganizationsModule = OrganizationModule;
