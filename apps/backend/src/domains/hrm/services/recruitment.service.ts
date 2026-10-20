import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import {
  CreateJobPostDto,
  ScheduleInterviewDto,
  SubmitAppraisalDto,
  SubmitJobApplicationDto,
  UpdateApplicationStageDto,
} from '../dto/recruitment.dto.js';

@Injectable()
export class RecruitmentService {
  constructor(private readonly prisma: PrismaService) {}

  async createJobPost(dto: CreateJobPostDto) {
    return this.prisma.job.create({
      data: {
        title: dto.title,
        category: dto.category,
        positionsCount: dto.positionsCount,
        description: dto.description,
        status: 'active',
      },
    });
  }

  async getActiveJobs() {
    return this.prisma.job.findMany({
      where: { status: 'active' },
      include: {
        applications: {
          select: { id: true, stage: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitJobApplication(dto: SubmitJobApplicationDto) {
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException('Job post not found');

    return this.prisma.jobApplication.create({
      data: {
        jobId: dto.jobId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        resumeUrl: dto.resumeUrl,
        stage: 'applied',
      },
      include: { job: true },
    });
  }

  async updateApplicationStage(applicationId: string, dto: UpdateApplicationStageDto) {
    const app = await this.prisma.jobApplication.findUnique({ where: { id: applicationId } });
    if (!app) throw new NotFoundException('Application not found');

    return this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { stage: dto.stage },
      include: { job: true, interviews: true },
    });
  }

  async scheduleInterview(dto: ScheduleInterviewDto) {
    const app = await this.prisma.jobApplication.findUnique({ where: { id: dto.applicationId } });
    if (!app) throw new NotFoundException('Application not found');

    const zoomUrl =
      dto.roundType === 'zoom_video'
        ? `https://zoom.us/j/987${Date.now().toString().slice(-7)}?pwd=omnistay_hire`
        : undefined;

    const interview = await this.prisma.interviewSchedule.create({
      data: {
        applicationId: dto.applicationId,
        scheduledDate: new Date(dto.scheduledDate),
        roundType: dto.roundType || 'zoom_video',
        zoomJoinUrl: zoomUrl,
        status: 'scheduled',
      },
    });

    // Advance applicant stage to 'interview'
    await this.prisma.jobApplication.update({
      where: { id: dto.applicationId },
      data: { stage: 'interview' },
    });

    return interview;
  }

  async submitAppraisal(dto: SubmitAppraisalDto) {
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    return this.prisma.appraisal.create({
      data: {
        employeeId: dto.employeeId,
        ratingScore: dto.ratingScore,
        reviewPeriod: dto.reviewPeriod,
        feedback: dto.feedback,
      },
      include: { employee: true },
    });
  }

  async registerHaccpCertification(employeeName: string, certName: string, expiryDateStr?: string) {
    return this.prisma.employeeCertification.create({
      data: {
        certName: certName || 'HACCP Level 2 Food Safety & Hygiene',
        issuedBy: 'ServSafe / National Hospitality Safety Board',
        expiryDate: expiryDateStr ? new Date(expiryDateStr) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }
}
