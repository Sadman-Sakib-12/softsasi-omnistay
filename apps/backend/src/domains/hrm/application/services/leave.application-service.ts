import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  HRM_REPOSITORY_TOKEN,
  type IHrmRepository,
} from '../../domain/repositories/hrm.repository.interface.js';
import { checkPeakHolidayBlackout } from '../../domain/rules/hrm.rule.js';
import type {
  CreateLeaveApplicationDto,
  ReviewLeaveApplicationDto,
} from '../../presentation/dto/leave.dto.js';

@Injectable()
export class LeaveApplicationService {
  constructor(
    @Inject(HRM_REPOSITORY_TOKEN)
    private readonly repo: IHrmRepository,
  ) {}

  async createLeaveType(title: string, daysPerYear = 14, isPaid = true) {
    return this.repo.createLeaveType({
      title,
      daysPerYear,
      isPaid,
    });
  }

  async getLeaveTypes(tenantId?: string) {
    return this.repo.findLeaveTypes(tenantId);
  }

  async applyForLeave(dto: CreateLeaveApplicationDto) {
    const employee = await this.repo.findEmployeeById(dto.employeeId);
    if (!employee) throw new NotFoundException('Employee not found');

    const leaveType = await this.repo.findLeaveTypeById(dto.leaveTypeId);
    if (!leaveType) throw new NotFoundException('Leave Type not found');

    const isSick = (leaveType.title || '').toLowerCase().includes('sick');
    const isBlackoutClash = checkPeakHolidayBlackout(dto.startDate, dto.endDate, isSick);

    if (isBlackoutClash) {
      throw new BadRequestException(
        'Blackout Policy Violation: Discretionary annual leaves are restricted during Peak Christmas / New Year Holiday season (Dec 24 - Jan 2).',
      );
    }

    return this.repo.createLeaveApplication({
      employeeId: dto.employeeId,
      leaveTypeId: dto.leaveTypeId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      reason: dto.reason,
      status: 'pending',
    });
  }

  async getLeaveApplications(employeeId?: string) {
    return this.repo.findLeaveApplications(employeeId);
  }

  async reviewLeaveApplication(
    applicationId: string,
    reviewerRole: string,
    dto: ReviewLeaveApplicationDto,
  ) {
    const application = await this.repo.findLeaveApplicationById(applicationId);
    if (!application) throw new NotFoundException('Leave application not found');

    let newStatus = dto.decision;

    if (dto.decision === 'head_approved') {
      newStatus = 'head_approved';
    } else if (dto.decision === 'hr_approved') {
      newStatus = 'hr_approved';
    } else if (dto.decision === 'rejected') {
      newStatus = 'rejected';
    }

    return this.repo.updateLeaveApplication(applicationId, {
      status: newStatus,
      remarks: dto.comments,
    });
  }
}
