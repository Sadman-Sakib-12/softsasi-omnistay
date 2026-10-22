import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Domain Token & Repo
import { PROJECT_REPOSITORY_TOKEN } from './domain/repositories/project.repository.interface.js';
import { PrismaProjectRepository } from './infrastructure/repositories/prisma-project.repository.js';

// Services
import { ProjectService } from './application/services/project.service.js';
import { TimesheetService } from './application/services/timesheet.service.js';
import { BugTrackerService } from './application/services/bug-tracker.service.js';

// Controllers
import { ProjectController } from './presentation/controllers/project.controller.js';
import { TimesheetController } from './presentation/controllers/timesheet.controller.js';
import { BugTrackerController } from './presentation/controllers/bug-tracker.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    ProjectController,
    TimesheetController,
    BugTrackerController,
  ],
  providers: [
    { provide: PROJECT_REPOSITORY_TOKEN, useClass: PrismaProjectRepository },
    ProjectService,
    TimesheetService,
    BugTrackerService,
  ],
  exports: [
    ProjectService,
    TimesheetService,
    BugTrackerService,
  ],
})
export class ProjectModule {}
