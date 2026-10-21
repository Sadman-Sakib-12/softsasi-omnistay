import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  HRM_REPOSITORY_TOKEN,
  type IHrmRepository,
} from '../../domain/repositories/hrm.repository.interface.js';
import {
  calculateWorkedHoursAndOvertime,
  isWithinGeofence,
} from '../../domain/rules/hrm.rule.js';
import type {
  BiometricHardwarePunchDto,
  CreateShiftScheduleDto,
  MobileGeofenceClockInDto,
} from '../../presentation/dto/attendance.dto.js';

@Injectable()
export class AttendanceApplicationService {
  constructor(
    @Inject(HRM_REPOSITORY_TOKEN)
    private readonly repo: IHrmRepository,
  ) {}

  // Standard resort perimeter location for geofencing (e.g. Miami Resort)
  private readonly PROPERTY_LAT = 25.7617;
  private readonly PROPERTY_LNG = -80.1918;
  private readonly GEOFENCE_RADIUS_METERS = 50.0;

  async recordBiometricPunch(dto: BiometricHardwarePunchDto) {
    const employee = await this.repo.findEmployeeByCodeSimple(dto.employeeCode);
    if (!employee) {
      throw new NotFoundException(`Employee with code ${dto.employeeCode} not found`);
    }

    const punchDate = new Date(dto.punchTime);
    const today = new Date(punchDate.toISOString().split('T')[0]);

    let attendance = await this.repo.findAttendanceByDate(employee.id, today);

    if (dto.punchType === 'clock_in') {
      if (!attendance) {
        attendance = await this.repo.createAttendance({
          employeeId: employee.id,
          date: today,
          clockIn: punchDate,
          status: 'Present',
        });
      } else {
        attendance = await this.repo.updateAttendance(attendance.id, {
          clockIn: punchDate,
          status: 'Present',
        });
      }
    } else {
      let otHours = 0;
      let totalHours = 8;
      if (attendance && attendance.clockIn) {
        const { totalWorkedHours, overtimeHours } = calculateWorkedHoursAndOvertime(
          new Date(attendance.clockIn),
          punchDate,
          8,
        );
        totalHours = totalWorkedHours;
        otHours = overtimeHours;
      }

      if (!attendance) {
        attendance = await this.repo.createAttendance({
          employeeId: employee.id,
          date: today,
          clockOut: punchDate,
          overtimeHours: otHours,
          totalHours,
          status: 'Present',
        });
      } else {
        attendance = await this.repo.updateAttendance(attendance.id, {
          clockOut: punchDate,
          overtimeHours: otHours,
          totalHours,
          status: 'Present',
        });
      }
    }

    return {
      message: `Biometric ${dto.punchType} logged from Terminal ${dto.deviceId}`,
      employeeCode: dto.employeeCode,
      employeeName: employee.fullName,
      punchTime: dto.punchTime,
      attendanceRecord: attendance,
    };
  }

  async recordMobileGeofencedClockIn(dto: MobileGeofenceClockInDto) {
    const { isWithin, distanceMeters } = isWithinGeofence(
      dto.latitude,
      dto.longitude,
      this.PROPERTY_LAT,
      this.PROPERTY_LNG,
      this.GEOFENCE_RADIUS_METERS,
    );

    if (!isWithin) {
      throw new BadRequestException(
        `Geofence validation failed. You are ${Math.round(distanceMeters)}m away from property perimeter (Allowed: ${this.GEOFENCE_RADIUS_METERS}m).`,
      );
    }

    return this.recordBiometricPunch({
      deviceId: 'MOBILE-GPS-GEOFENCE',
      employeeCode: dto.employeeCode,
      punchTime: new Date().toISOString(),
      punchType: dto.punchType,
    });
  }

  async createShiftSchedule(dto: CreateShiftScheduleDto) {
    return this.repo.createShiftSchedule({
      shiftName: dto.shiftName,
      startTime: dto.startTime,
      endTime: dto.endTime,
      isOvernight: dto.isOvernight || false,
    });
  }

  async getShiftSchedules() {
    return this.repo.findShiftSchedules();
  }

  async calculateMonthlyOvertime(employeeId: string, monthPrefix: string) {
    const startDate = new Date(`${monthPrefix}-01`);
    const endDate = new Date(`${monthPrefix}-31`);
    const attendances = await this.repo.findEmployeeAttendances(employeeId, startDate, endDate);

    const totalOtHours = attendances.reduce(
      (acc: number, a: any) => acc + Number(a.overtimeHours || 0),
      0,
    );

    return {
      employeeId,
      month: monthPrefix,
      totalOtHours: Number(totalOtHours.toFixed(2)),
      recordsCount: attendances.length,
    };
  }
}
