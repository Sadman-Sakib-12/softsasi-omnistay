import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Public, Roles, RolesGuard } from '@omnistay/backend-common';
import { AttendanceApplicationService } from '../../application/services/attendance.application-service.js';
import {
  BiometricHardwarePunchDto,
  CreateShiftScheduleDto,
  MobileGeofenceClockInDto,
} from '../dto/attendance.dto.js';

@ApiTags('HRM - Attendance, Biometrics & Shifts')
@Controller('api/v1/hrm/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceApplicationService) {}

  @Post('biometric-punch')
  @Public()
  @ApiOperation({ summary: 'Hardware API ingest for ZKTeco/Hikvision biometric punch timestamps' })
  recordBiometricPunch(@Body() dto: BiometricHardwarePunchDto) {
    return this.attendanceService.recordBiometricPunch(dto);
  }

  @Post('mobile-clock-in')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mobile GPS geo-fenced clock-in (validates distance <= 50m of property)' })
  recordMobileGeofencedClockIn(@Body() dto: MobileGeofenceClockInDto) {
    return this.attendanceService.recordMobileGeofencedClockIn(dto);
  }

  @Post('shifts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director', 'Operations Manager')
  @ApiOperation({ summary: 'Create 24/7 rotational shift schedule (Morning, Afternoon, Night Audit)' })
  createShiftSchedule(@Body() dto: CreateShiftScheduleDto) {
    return this.attendanceService.createShiftSchedule(dto);
  }

  @Get('shifts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all shift schedules' })
  getShiftSchedules() {
    return this.attendanceService.getShiftSchedules();
  }

  @Get('overtime/:employeeId/:month')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get total calculated overtime hours for an employee in a given month' })
  calculateMonthlyOvertime(
    @Param('employeeId') employeeId: string,
    @Param('month') month: string,
  ) {
    return this.attendanceService.calculateMonthlyOvertime(employeeId, month);
  }
}
