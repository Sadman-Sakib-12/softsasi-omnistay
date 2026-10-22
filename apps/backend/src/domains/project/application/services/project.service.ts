import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProjectRepository } from '../../domain/repositories/project.repository.interface.js';
import { PROJECT_REPOSITORY_TOKEN } from '../../domain/repositories/project.repository.interface.js';
import {
  AddProjectExpenseDto,
  CreateProjectDto,
  CreateProjectMilestoneDto,
  CreateProjectTaskDto,
  SetProjectBudgetDto,
} from '../../presentation/dto/project.dto.js';

@Injectable()
export class ProjectService {
  constructor(
    @Inject(PROJECT_REPOSITORY_TOKEN)
    private readonly repo: IProjectRepository,
  ) {}

  async createProject(tenantId: string, dto: CreateProjectDto) {
    return this.repo.createProject({
      tenantId,
      projectName: dto.projectName,
      description: dto.description,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      status: dto.status || 'planning',
    });
  }

  async listProjects(tenantId: string) {
    return this.repo.findProjects(tenantId);
  }

  async getProject(id: string) {
    const project = await this.repo.findProjectById(id);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async addMilestone(projectId: string, dto: CreateProjectMilestoneDto) {
    await this.getProject(projectId);

    return this.repo.createMilestone({
      projectId,
      title: dto.title,
      dueDate: new Date(dto.dueDate),
      status: dto.status || 'pending',
    });
  }

  async addTask(projectId: string, dto: CreateProjectTaskDto) {
    await this.getProject(projectId);

    return this.repo.createTask({
      projectId,
      milestoneId: dto.milestoneId,
      title: dto.title,
      description: dto.description,
      priority: dto.priority || 'medium',
      status: dto.status || 'todo',
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      assignedTo: dto.assignedTo,
    });
  }

  async setBudget(projectId: string, dto: SetProjectBudgetDto) {
    await this.getProject(projectId);
    return this.repo.setBudget({ projectId, totalBudget: dto.totalBudget });
  }

  async addExpense(projectId: string, dto: AddProjectExpenseDto) {
    await this.getProject(projectId);

    return this.repo.addExpense({
      projectId,
      itemTitle: dto.itemTitle,
      amount: dto.amount,
      expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : new Date(),
    });
  }

  async getGanttTimeline(projectId: string) {
    const project = await this.getProject(projectId);
    const milestones = await this.repo.findMilestonesByProjectId(projectId);
    const tasks = await this.repo.findTasksByProjectId(projectId);
    const budget = await this.repo.findBudgetByProjectId(projectId);
    const expenses = await this.repo.findExpensesByProjectId(projectId);

    const totalSpent = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);
    const allocatedBudget = budget ? Number(budget.totalBudget) : 0;
    const variance = allocatedBudget - totalSpent;

    return {
      projectId: project.id,
      projectName: project.projectName,
      status: project.status,
      milestones,
      tasks,
      financials: {
        allocatedBudget,
        totalSpent,
        variance,
        isOverBudget: variance < 0,
      },
    };
  }
}
