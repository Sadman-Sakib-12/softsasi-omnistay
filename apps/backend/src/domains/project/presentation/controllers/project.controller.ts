import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { ProjectService } from '../../application/services/project.service.js';
import {
  AddProjectExpenseDto,
  CreateProjectDto,
  CreateProjectMilestoneDto,
  CreateProjectTaskDto,
  SetProjectBudgetDto,
} from '../dto/project.dto.js';

@ApiTags('Project Management - Hotel Renovation & Special Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create capital renovation or special event project' })
  createProject(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.createProject(user.organizationId || 'org-master', dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tenant renovation and capital projects' })
  listProjects(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.projectService.listProjects(user.organizationId || 'org-master');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project master details with tasks, budget and milestones' })
  getProject(@Param('id') id: string) {
    return this.projectService.getProject(id);
  }

  @Post(':id/milestones')
  @ApiOperation({ summary: 'Add Gantt milestone deadline to project' })
  addMilestone(@Param('id') id: string, @Body() dto: CreateProjectMilestoneDto) {
    return this.projectService.addMilestone(id, dto);
  }

  @Post(':id/tasks')
  @ApiOperation({ summary: 'Add work task with dependencies and assignee' })
  addTask(@Param('id') id: string, @Body() dto: CreateProjectTaskDto) {
    return this.projectService.addTask(id, dto);
  }

  @Post(':id/budget')
  @ApiOperation({ summary: 'Set total authorized budget for capital project' })
  setBudget(@Param('id') id: string, @Body() dto: SetProjectBudgetDto) {
    return this.projectService.setBudget(id, dto);
  }

  @Post(':id/expenses')
  @ApiOperation({ summary: 'Log project contractor/material expenditure against budget' })
  addExpense(@Param('id') id: string, @Body() dto: AddProjectExpenseDto) {
    return this.projectService.addExpense(id, dto);
  }

  @Get(':id/gantt')
  @ApiOperation({ summary: 'Get visual Gantt chart timeline and financial variance metrics' })
  getGantt(@Param('id') id: string) {
    return this.projectService.getGanttTimeline(id);
  }
}
