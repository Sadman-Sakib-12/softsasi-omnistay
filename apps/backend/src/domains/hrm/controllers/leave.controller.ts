import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { LeaveService } from '../services/leave.service.js';
import { CreateLeaveApplicationDto, ReviewLeaveApplicationDto } from '../dto/leave.dto.js';

@ApiTags('HRM - Leave Management & Approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/hrm/leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get('types')
  @ApiOperation({ summary: 'List all leave types (Annual, Sick, Casual, Maternity, Unpaid)' })
  getLeaveTypes() {
    return this.leaveService.getLeaveTypes();
  }

  @Post('apply')
  @ApiOperation({ summary: 'Submit leave request (enforces holiday blackout checks)' })
  applyForLeave(@Body() dto: CreateLeaveApplicationDto) {
    return this.leaveService.applyForLeave(dto);
  }

  @Get('applications')
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiOperation({ summary: 'List leave applications' })
  getLeaveApplications(@Query('employeeId') employeeId?: string) {
    return this.leaveService.getLeaveApplications(employeeId);
  }

  @Patch('applications/:id/review')
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director', 'Department Head', 'Executive Chef')
  @ApiOperation({ summary: 'Review leave request (3-Tier workflow: Head Approval -> HR Director Approval)' })
  reviewLeaveApplication(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('id') id: string,
    @Body() dto: ReviewLeaveApplicationDto,
  ) {
    const reviewerRole = user.role || 'Staff';
    return this.leaveService.reviewLeaveApplication(id, reviewerRole, dto);
  }
}
