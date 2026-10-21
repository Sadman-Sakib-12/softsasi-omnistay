import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { PayrollApplicationService } from '../../application/services/payroll.application-service.js';
import { CreateServiceChargePoolDto, RunMonthlyPayrollDto, SetSalaryDto } from '../dto/payroll.dto.js';

@ApiTags('HRM - Payroll & Compensation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/hrm/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollApplicationService) {}

  @Post('salary-setup')
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director')
  @ApiOperation({ summary: 'Configure employee basic contract salary and type' })
  setSalary(@Body() dto: SetSalaryDto) {
    return this.payrollService.setSalary(dto);
  }

  @Post('service-charge-pool')
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director', 'Financial Controller')
  @ApiOperation({ summary: 'Create monthly 10% guest service charge pool for equal staff distribution' })
  createServiceChargePool(@Body() dto: CreateServiceChargePoolDto) {
    return this.payrollService.createServiceChargePool(dto);
  }

  @Get('service-charge-pool/:month')
  @ApiOperation({ summary: 'Get service charge pool metrics and per-pax distribution share' })
  getServiceChargePool(@Param('month') month: string) {
    return this.payrollService.getServiceChargePool(month);
  }

  @Post('run')
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director', 'Financial Controller')
  @ApiOperation({ summary: 'Execute automated monthly payroll run with OT, service charge, loan deductions & PDF payslips' })
  runMonthlyPayroll(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: RunMonthlyPayrollDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.payrollService.runMonthlyPayroll(tenantId, dto);
  }

  @Get('payslips/:employeeId')
  @ApiOperation({ summary: 'Get payslips history for an employee' })
  getEmployeePaySlips(@Param('employeeId') employeeId: string) {
    return this.payrollService.getEmployeePaySlips(employeeId);
  }
}
