import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';
import { HRM_REPOSITORY_TOKEN } from './domain/repositories/hrm.repository.interface.js';
import { PrismaHrmRepository } from './infrastructure/repositories/prisma-hrm.repository.js';
import { EmployeeApplicationService } from './application/services/employee.application-service.js';
import { AttendanceApplicationService } from './application/services/attendance.application-service.js';
import { LeaveApplicationService } from './application/services/leave.application-service.js';
import { PayrollApplicationService } from './application/services/payroll.application-service.js';
import { RecruitmentApplicationService } from './application/services/recruitment.application-service.js';
import { EmployeeController } from './presentation/controllers/employee.controller.js';
import { AttendanceController } from './presentation/controllers/attendance.controller.js';
import { LeaveController } from './presentation/controllers/leave.controller.js';
import { PayrollController } from './presentation/controllers/payroll.controller.js';
import { RecruitmentController } from './presentation/controllers/recruitment.controller.js';

// Backward compatibility aliases
export const EmployeeService = EmployeeApplicationService;
export const AttendanceService = AttendanceApplicationService;
export const LeaveService = LeaveApplicationService;
export const PayrollService = PayrollApplicationService;
export const RecruitmentService = RecruitmentApplicationService;

@Module({
  imports: [PrismaModule],
  controllers: [
    EmployeeController,
    AttendanceController,
    LeaveController,
    PayrollController,
    RecruitmentController,
  ],
  providers: [
    {
      provide: HRM_REPOSITORY_TOKEN,
      useClass: PrismaHrmRepository,
    },
    EmployeeApplicationService,
    AttendanceApplicationService,
    LeaveApplicationService,
    PayrollApplicationService,
    RecruitmentApplicationService,
  ],
  exports: [
    HRM_REPOSITORY_TOKEN,
    EmployeeApplicationService,
    AttendanceApplicationService,
    LeaveApplicationService,
    PayrollApplicationService,
    RecruitmentApplicationService,
  ],
})
export class HrmModule {}
