import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Public, Roles, RolesGuard } from '@omnistay/backend-common';
import { RecruitmentService } from '../services/recruitment.service.js';
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
  constructor(private readonly recruitmentService: RecruitmentService) {}

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

  @Post('appraisals')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director', 'Department Head')
  @ApiOperation({ summary: 'Submit 360-degree performance appraisal and rating' })
  submitAppraisal(@Body() dto: SubmitAppraisalDto) {
    return this.recruitmentService.submitAppraisal(dto);
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
}
