import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  HRM_REPOSITORY_TOKEN,
  type IHrmRepository,
} from '../../domain/repositories/hrm.repository.interface.js';
import type {
  CreateJobPostDto,
  ScheduleInterviewDto,
  SubmitAppraisalDto,
  SubmitJobApplicationDto,
  UpdateApplicationStageDto,
} from '../../presentation/dto/recruitment.dto.js';

@Injectable()
export class RecruitmentApplicationService {
  constructor(
    @Inject(HRM_REPOSITORY_TOKEN)
    private readonly repo: IHrmRepository,
  ) {}

  async createJobPost(dto: CreateJobPostDto) {
    return this.repo.createJob({
      title: dto.title,
      category: dto.category,
      positionsCount: dto.positionsCount,
      description: dto.description,
      status: 'active',
    });
  }

  async getActiveJobs(tenantId?: string) {
    return this.repo.findJobs(tenantId);
  }

  async submitJobApplication(dto: SubmitJobApplicationDto) {
    const job = await this.repo.findJobById(dto.jobId);
    if (!job) throw new NotFoundException('Job post not found');

    return this.repo.createJobApplication({
      jobId: dto.jobId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      resumeUrl: dto.resumeUrl,
      stage: 'applied',
    });
  }

  async updateApplicationStage(applicationId: string, dto: UpdateApplicationStageDto) {
    const app = await this.repo.findJobApplicationById(applicationId);
    if (!app) throw new NotFoundException('Application not found');

    return this.repo.updateJobApplication(applicationId, {
      stage: dto.stage,
    });
  }

  async scheduleInterview(dto: ScheduleInterviewDto) {
    const app = await this.repo.findJobApplicationById(dto.applicationId);
    if (!app) throw new NotFoundException('Application not found');

    const zoomUrl =
      dto.roundType === 'zoom_video'
        ? `https://zoom.us/j/987${Date.now().toString().slice(-7)}?pwd=omnistay_hire`
        : undefined;

    const interview = await this.repo.createInterviewSchedule({
      applicationId: dto.applicationId,
      scheduledDate: new Date(dto.scheduledDate),
      roundType: dto.roundType || 'zoom_video',
      zoomJoinUrl: zoomUrl,
      status: 'scheduled',
    });

    await this.repo.updateJobApplication(dto.applicationId, {
      stage: 'interview',
    });

    return interview;
  }

  async submitAppraisal(dto: SubmitAppraisalDto) {
    const employee = await this.repo.findEmployeeById(dto.employeeId);
    if (!employee) throw new NotFoundException('Employee not found');

    return this.repo.createAppraisal({
      employeeId: dto.employeeId,
      ratingScore: dto.ratingScore,
      reviewPeriod: dto.reviewPeriod,
      feedback: dto.feedback,
    });
  }

  async registerHaccpCertification(employeeName: string, certName: string, expiryDateStr?: string) {
    return this.repo.createEmployeeCertification({
      certName: certName || 'HACCP Level 2 Food Safety & Hygiene',
      issuedBy: 'ServSafe / National Hospitality Safety Board',
      expiryDate: expiryDateStr
        ? new Date(expiryDateStr)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
  }
}
