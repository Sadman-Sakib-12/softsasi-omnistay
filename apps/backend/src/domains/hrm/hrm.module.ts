import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';
import { EmployeeService } from './services/employee.service.js';
import { AttendanceService } from './services/attendance.service.js';
import { LeaveService } from './services/leave.service.js';
import { PayrollService } from './services/payroll.service.js';
import { RecruitmentService } from './services/recruitment.service.js';
import { EmployeeController } from './controllers/employee.controller.js';
import { AttendanceController } from './controllers/attendance.controller.js';
import { LeaveController } from './controllers/leave.controller.js';
import { PayrollController } from './controllers/payroll.controller.js';
import { RecruitmentController } from './controllers/recruitment.controller.js';

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
    EmployeeService,
    AttendanceService,
    LeaveService,
    PayrollService,
    RecruitmentService,
  ],
  exports: [
    EmployeeService,
    AttendanceService,
    LeaveService,
    PayrollService,
    RecruitmentService,
  ],
})
export class HrmModule {}
