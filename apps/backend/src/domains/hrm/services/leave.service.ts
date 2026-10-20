import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateLeaveApplicationDto, ReviewLeaveApplicationDto } from '../dto/leave.dto.js';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async createLeaveType(title: string, daysPerYear = 14, isPaid = true) {
    return this.prisma.leaveType.create({
      data: {
        title,
        daysPerYear,
        isPaid,
      },
    });
  }

  async getLeaveTypes() {
    return this.prisma.leaveType.findMany();
  }

  /**
   * Validates whether requested dates clash with peak holiday blackout window (Dec 24 - Jan 2).
   */
  private checkPeakHolidayBlackout(startDateStr: string, endDateStr: string, isEmergency = false): boolean {
    if (isEmergency) return false;

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    // Check if month is December (11) and day >= 24 or January (0) and day <= 2
    const startMonth = start.getUTCMonth();
    const startDay = start.getUTCDate();
    const endMonth = end.getUTCMonth();
    const endDay = end.getUTCDate();

    const isChristmasWindow =
      (startMonth === 11 && startDay >= 24) || (endMonth === 0 && endDay <= 2);

    return isChristmasWindow;
  }

  async applyForLeave(dto: CreateLeaveApplicationDto) {
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    const leaveType = await this.prisma.leaveType.findUnique({ where: { id: dto.leaveTypeId } });
    if (!leaveType) throw new NotFoundException('Leave Type not found');

    const isSick = leaveType.title.toLowerCase().includes('sick');
    const isBlackoutClash = this.checkPeakHolidayBlackout(dto.startDate, dto.endDate, isSick);

    if (isBlackoutClash) {
      throw new BadRequestException(
        'Blackout Policy Violation: Discretionary annual leaves are restricted during Peak Christmas / New Year Holiday season (Dec 24 - Jan 2).',
      );
    }

    return this.prisma.leaveApplication.create({
      data: {
        employeeId: dto.employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
        status: 'pending',
      },
      include: {
        leaveType: true,
        employee: true,
      },
    });
  }

  async getLeaveApplications(employeeId?: string) {
    return this.prisma.leaveApplication.findMany({
      where: employeeId ? { employeeId } : undefined,
      include: {
        employee: true,
        leaveType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewLeaveApplication(applicationId: string, reviewerRole: string, dto: ReviewLeaveApplicationDto) {
    const application = await this.prisma.leaveApplication.findUnique({
      where: { id: applicationId },
      include: { employee: true, leaveType: true },
    });
    if (!application) throw new NotFoundException('Leave application not found');

    let newStatus = dto.decision;

    // 3-Tier hierarchy enforcement:
    // If Dept Head reviews: can set 'head_approved' or 'rejected'
    // If HR Director reviews: can set 'hr_approved' or 'rejected'
    if (dto.decision === 'head_approved') {
      newStatus = 'head_approved';
    } else if (dto.decision === 'hr_approved') {
      newStatus = 'hr_approved';
    } else {
      newStatus = 'rejected';
    }

    return this.prisma.leaveApplication.update({
      where: { id: applicationId },
      data: { status: newStatus },
      include: { employee: true, leaveType: true },
    });
  }
}
