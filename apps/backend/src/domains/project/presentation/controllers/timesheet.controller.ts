import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Public } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { TimesheetService } from '../../application/services/timesheet.service.js';
import {
  StartTimeTrackerDto,
  StopTimeTrackerDto,
  SubmitWeeklyTimesheetDto,
} from '../dto/project.dto.js';

@ApiTags('Project Management - Employee Timesheets & Time Tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/projects/timesheets')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}

  @Public()
  @Get('overview')
  @ApiOperation({ summary: 'Get enterprise timesheet overview, active trackers & screenshot proofs' })
  getOverview() {
    return this.timesheetService.getOverview();
  }

  @Public()
  @Post('start')
  @ApiOperation({ summary: 'Start desktop / mobile task time logging tracker' })
  startTracking(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: StartTimeTrackerDto,
  ) {
    return this.timesheetService.startTracking(user?.userId || '00000000-0000-4000-a000-000000000001', dto);
  }

  @Public()
  @Post(':id/stop')
  @ApiOperation({ summary: 'Stop active time tracker and capture screenshot proof' })
  stopTracking(@Param('id') id: string, @Body() dto: StopTimeTrackerDto) {
    return this.timesheetService.stopTracking(id, dto);
  }

  @Public()
  @Get('my-logs')
  @ApiOperation({ summary: 'Retrieve personal time tracking activity logs' })
  getMyLogs(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.timesheetService.getUserTimeLogs(user?.userId || '00000000-0000-4000-a000-000000000001');
  }

  @Public()
  @Post('weekly')
  @ApiOperation({ summary: 'Submit formal weekly hours timesheet for payroll/billing approval' })
  submitWeekly(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: SubmitWeeklyTimesheetDto,
  ) {
    return this.timesheetService.submitWeeklyTimesheet(user?.userId || '00000000-0000-4000-a000-000000000001', dto);
  }

  @Public()
  @Get('weekly/my-history')
  @ApiOperation({ summary: 'View historical submitted weekly timesheets' })
  getWeeklyHistory(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.timesheetService.getWeeklyTimesheets(user?.userId || '00000000-0000-4000-a000-000000000001');
  }
}
