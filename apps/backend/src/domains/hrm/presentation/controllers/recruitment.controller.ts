import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Public, Roles, RolesGuard } from '@omnistay/backend-common';
import { RecruitmentApplicationService } from '../../application/services/recruitment.application-service.js';
import {
  CreateJobPostDto,
  ScheduleInterviewDto,
  SubmitAppraisalDto,
  SubmitJobApplicationDto,
  UpdateApplicationStageDto,
} from '../dto/recruitment.dto.js';

@ApiTags('HRM - Recruitment ATS & Talent Lifecycle')
@Controller('api/v1/hrm/recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentApplicationService) {}

  @Post('jobs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director')
  @ApiOperation({ summary: 'Post job vacancy on career portal' })
  createJobPost(@Body() dto: CreateJobPostDto) {
    return this.recruitmentService.createJobPost(dto);
  }

  @Get('jobs')
  @Public()
  @ApiOperation({ summary: 'List open active career opportunities' })
  getActiveJobs() {
    return this.recruitmentService.getActiveJobs();
  }

  @Post('apply')
  @Public()
  @ApiOperation({ summary: 'Submit job application with resume URL' })
  submitJobApplication(@Body() dto: SubmitJobApplicationDto) {
    return this.recruitmentService.submitJobApplication(dto);
  }

  @Get('applications')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'jobId', required: false })
  @ApiOperation({ summary: 'List job applications for candidate Kanban tracking' })
  getAllApplications(@Query('jobId') jobId?: string) {
    return this.recruitmentService.getAllApplications(jobId);
  }

  @Patch('applications/:id/stage')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director')
  @ApiOperation({ summary: 'Transition candidate stage in Kanban pipeline' })
  updateApplicationStage(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStageDto,
  ) {
    return this.recruitmentService.updateApplicationStage(id, dto);
  }

  @Post('interviews')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director')
  @ApiOperation({ summary: 'Schedule candidate interview with auto-generated Zoom video link' })
  scheduleInterview(@Body() dto: ScheduleInterviewDto) {
    return this.recruitmentService.scheduleInterview(dto);
  }

  // 10.7 Performance Appraisals & Goal Tracking
  @Post('appraisals')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director', 'Department Head')
  @ApiOperation({ summary: 'Submit 360-degree performance appraisal and rating' })
  submitAppraisal(@Body() dto: SubmitAppraisalDto) {
    return this.recruitmentService.submitAppraisal(dto);
  }

  @Get('appraisals')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiOperation({ summary: 'Get performance appraisals and review feedback' })
  getAppraisals(@Query('employeeId') employeeId?: string) {
    return this.recruitmentService.getAppraisals(employeeId);
  }

  @Get('goals')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List SMART performance goals and progress' })
  getGoals() {
    return this.recruitmentService.getGoalTrackings();
  }

  @Post('goals')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director')
  @ApiOperation({ summary: 'Create SMART goal target' })
  createGoal(@Body() dto: any) {
    return this.recruitmentService.createGoalTracking(dto);
  }

  // 10.8 Training & Certifications
  @Get('trainings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List hospitality training programs' })
  getTrainingPrograms() {
    return this.recruitmentService.getTrainingPrograms();
  }

  @Get('certifications')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List employee professional certifications with expiry tracking' })
  getCertifications() {
    return this.recruitmentService.getCertifications();
  }

  @Post('certifications/haccp')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director', 'Executive Chef')
  @ApiOperation({ summary: 'Register HACCP Level 2 Food Safety & Hygiene certification' })
  registerHaccpCertification(
    @Body('employeeName') employeeName: string,
    @Body('certName') certName: string,
    @Body('expiryDate') expiryDate?: string,
  ) {
    return this.recruitmentService.registerHaccpCertification(employeeName, certName, expiryDate);
  }

  // 10.9 HR Administration & Compliance
  @Get('admin-workflows')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get awards, complaints, warnings, and offboarding records' })
  getAdminWorkflows() {
    return this.recruitmentService.getAdminWorkflows();
  }

  @Patch('offboarding/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director')
  @ApiOperation({ summary: 'Toggle returned item on offboarding checklist' })
  toggleOffboardingItem(
    @Param('id') id: string,
    @Body('isReturned') isReturned: boolean,
  ) {
    return this.recruitmentService.toggleOffboardingItem(id, isReturned);
  }
}
