import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name/title', example: 'Ocean Wing Renovation 2026' })
  @IsString()
  @IsNotEmpty()
  projectName!: string;

  @ApiPropertyOptional({ description: 'Detailed project description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Start date ISO string' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Expected completion date ISO string' })
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Project status: planning, active, quality_inspection, completed', example: 'active' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateProjectMilestoneDto {
  @ApiProperty({ description: 'Milestone title', example: 'Architectural Blueprint Sign-off' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Due date' })
  @IsNotEmpty()
  dueDate!: string;

  @ApiPropertyOptional({ description: 'Status: pending, completed', example: 'pending' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateProjectTaskDto {
  @ApiPropertyOptional({ description: 'Associated milestone UUID' })
  @IsString()
  @IsOptional()
  milestoneId?: string;

  @ApiProperty({ description: 'Task title', example: 'HVAC Ducting & Electrical Inspection' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Task description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Priority: low, medium, high, critical', example: 'high' })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ description: 'Status: todo, in_progress, review, done', example: 'todo' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Assignee User UUID' })
  @IsString()
  @IsOptional()
  assignedTo?: string;
}

export class SetProjectBudgetDto {
  @ApiProperty({ description: 'Total allocated budget amount', example: 150000.0 })
  @IsNumber()
  @Min(0)
  totalBudget!: number;
}

export class AddProjectExpenseDto {
  @ApiProperty({ description: 'Expense item description', example: 'Plumbing Fixtures Procurement' })
  @IsString()
  @IsNotEmpty()
  itemTitle!: string;

  @ApiProperty({ description: 'Expense amount', example: 12500.0 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ description: 'Expense date' })
  @IsOptional()
  expenseDate?: string;
}

export class StartTimeTrackerDto {
  @ApiPropertyOptional({ description: 'Task UUID being worked on' })
  @IsString()
  @IsOptional()
  taskId?: string;

  @ApiPropertyOptional({ description: 'Is time billable to client', default: true })
  @IsBoolean()
  @IsOptional()
  isBillable?: boolean;
}

export class StopTimeTrackerDto {
  @ApiPropertyOptional({ description: 'Screen snapshot proof URL' })
  @IsString()
  @IsOptional()
  photoUrl?: string;
}

export class SubmitWeeklyTimesheetDto {
  @ApiProperty({ description: 'Calendar week number (1 - 53)', example: 42 })
  @IsNumber()
  weekNumber!: number;

  @ApiProperty({ description: 'Calendar year', example: 2026 })
  @IsNumber()
  year!: number;

  @ApiProperty({ description: 'Total hours worked', example: 40.5 })
  @IsNumber()
  @Min(0)
  totalHours!: number;
}

export class CreateBugDto {
  @ApiProperty({ description: 'Defect summary / title', example: 'POS KDS ticket duplicate printing on split tables' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Steps to reproduce and environment description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ description: 'Severity: minor, major, critical', example: 'major' })
  @IsString()
  @IsOptional()
  severity?: string;

  @ApiPropertyOptional({ description: 'Priority: low, normal, high, urgent', example: 'high' })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ description: 'Assignee engineer UUID' })
  @IsString()
  @IsOptional()
  assignedTo?: string;
}

export class UpdateBugStatusDto {
  @ApiProperty({ description: 'New BugStatus UUID or Name: New, In Progress, Under Review, Resolved, Closed' })
  @IsString()
  @IsNotEmpty()
  statusId!: string;
}

export class AddBugCommentDto {
  @ApiProperty({ description: 'Comment text or resolution notes' })
  @IsString()
  @IsNotEmpty()
  comment!: string;
}
