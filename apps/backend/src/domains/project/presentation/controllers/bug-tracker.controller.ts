import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { BugTrackerService } from '../../application/services/bug-tracker.service.js';
import { AddBugCommentDto, CreateBugDto, UpdateBugStatusDto } from '../dto/project.dto.js';

@ApiTags('Project Management - Internal Bug & Defect Tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/projects/bugs')
export class BugTrackerController {
  constructor(private readonly bugService: BugTrackerService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an internal bug or defect ticket' })
  createBug(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateBugDto,
  ) {
    return this.bugService.createBug(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all open and resolved bug tickets' })
  listBugs() {
    return this.bugService.listBugs();
  }

  @Get('statuses')
  @ApiOperation({ summary: 'Get workflow lifecycle statuses (New, In Progress, Resolved, Closed)' })
  getStatuses() {
    return this.bugService.getStatuses();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bug defect details with comments and error attachments' })
  getBug(@Param('id') id: string) {
    return this.bugService.getBug(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Transition bug status in defect lifecycle' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBugStatusDto) {
    return this.bugService.updateStatus(id, dto);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add investigation notes or discussion comment to bug ticket' })
  addComment(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: AddBugCommentDto,
  ) {
    return this.bugService.addComment(id, user.userId, dto);
  }
}
