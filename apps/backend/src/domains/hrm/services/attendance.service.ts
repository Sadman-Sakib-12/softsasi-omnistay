import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import {
  BiometricHardwarePunchDto,
  CreateShiftScheduleDto,
  MobileGeofenceClockInDto,
} from '../dto/attendance.dto.js';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  // Standard resort perimeter location for geofencing (e.g. Miami Resort)
  private readonly PROPERTY_LAT = 25.7617;
  private readonly PROPERTY_LNG = -80.1918;
  private readonly GEOFENCE_RADIUS_METERS = 50.0;

  /**
   * Computes geographic distance in meters between two GPS coordinates using the Haversine formula.
   */
  private calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async recordBiometricPunch(dto: BiometricHardwarePunchDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { employeeCode: dto.employeeCode },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with code ${dto.employeeCode} not found`);
    }

    const punchDate = new Date(dto.punchTime);
    const today = new Date(punchDate.toISOString().split('T')[0]);

    let attendance = await this.prisma.attendanceEmployee.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
    });

    if (dto.punchType === 'clock_in') {
      if (!attendance) {
        attendance = await this.prisma.attendanceEmployee.create({
          data: {
            employeeId: employee.id,
            date: today,
            clockIn: punchDate,
            status: 'Present',
          },
        });
      } else {
        attendance = await this.prisma.attendanceEmployee.update({
          where: { id: attendance.id },
          data: { clockIn: punchDate, status: 'Present' },
        });
      }
    } else {
      // Clock out: compute total hours worked and overtime
      let otHours = 0;
      if (attendance && attendance.clockIn) {
        const totalDurationHours =
          (punchDate.getTime() - new Date(attendance.clockIn).getTime()) / (1000 * 60 * 60);
        // Standard shift is 8.0 hours; anything above is Overtime
        otHours = Math.max(0, Number((totalDurationHours - 8.0).toFixed(2)));
      }

      if (!attendance) {
        attendance = await this.prisma.attendanceEmployee.create({
          data: {
            employeeId: employee.id,
            date: today,
            clockOut: punchDate,
            overtimeHours: otHours,
            status: 'Present',
          },
        });
      } else {
        attendance = await this.prisma.attendanceEmployee.update({
          where: { id: attendance.id },
          data: {
            clockOut: punchDate,
            overtimeHours: otHours,
          },
        });
      }
    }

    return {
      success: true,
      deviceId: dto.deviceId,
      employeeCode: dto.employeeCode,
      employeeName: employee.fullName,
      punchType: dto.punchType,
      punchTime: dto.punchTime,
      attendanceRecordId: attendance.id,
      overtimeHours: Number(attendance.overtimeHours),
    };
  }

  async recordMobileGeofencedClockIn(dto: MobileGeofenceClockInDto) {
    const distanceMeters = this.calculateDistanceMeters(
      dto.latitude,
      dto.longitude,
      this.PROPERTY_LAT,
      this.PROPERTY_LNG,
    );

    if (distanceMeters > this.GEOFENCE_RADIUS_METERS) {
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
    return this.prisma.shiftSchedule.create({
      data: {
        shiftName: dto.shiftName,
        startTime: dto.startTime,
        endTime: dto.endTime,
        isOvernight: dto.isOvernight || false,
      },
    });
  }

  async getShiftSchedules() {
    return this.prisma.shiftSchedule.findMany({
      orderBy: { startTime: 'asc' },
    });
  }

  async calculateMonthlyOvertime(employeeId: string, monthPrefix: string) {
    const attendances = await this.prisma.attendanceEmployee.findMany({
      where: {
        employeeId,
        date: {
          gte: new Date(`${monthPrefix}-01`),
          lte: new Date(`${monthPrefix}-31`),
        },
      },
    });

    const totalOtHours = attendances.reduce((acc, a) => acc + Number(a.overtimeHours), 0);
    return {
      employeeId,
      month: monthPrefix,
      totalOtHours: Number(totalOtHours.toFixed(2)),
      recordsCount: attendances.length,
    };
  }
}
