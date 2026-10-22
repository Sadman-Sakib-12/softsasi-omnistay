import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IProjectRepository } from '../../domain/repositories/project.repository.interface.js';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(data: any) {
    return this.prisma.project.create({ data });
  }

  async findProjects(tenantId: string) {
    return this.prisma.project.findMany({
      where: { tenantId },
      include: {
        milestones: true,
        tasks: true,
        budgets: true,
        expenses: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findProjectById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        milestones: true,
        tasks: {
          include: {
            dependencies: true,
            dependents: true,
            timeLogs: true,
          },
        },
        budgets: true,
        expenses: true,
        members: true,
      },
    });
  }

  async updateProject(id: string, data: Record<string, any>) {
    return this.prisma.project.update({ where: { id }, data });
  }

  async createMilestone(data: any) {
    return this.prisma.projectMilestone.create({ data });
  }

  async findMilestonesByProjectId(projectId: string) {
    return this.prisma.projectMilestone.findMany({
      where: { projectId },
      orderBy: { dueDate: 'asc' },
    });
  }

  async createTask(data: any) {
    return this.prisma.projectTask.create({ data });
  }

  async findTasksByProjectId(projectId: string) {
    return this.prisma.projectTask.findMany({
      where: { projectId },
      include: { milestone: true, dependencies: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateTask(id: string, data: Record<string, any>) {
    return this.prisma.projectTask.update({ where: { id }, data });
  }

  async setBudget(data: any) {
    return this.prisma.projectBudget.create({ data });
  }

  async addExpense(data: any) {
    return this.prisma.projectExpense.create({ data });
  }

  async findBudgetByProjectId(projectId: string) {
    return this.prisma.projectBudget.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findExpensesByProjectId(projectId: string) {
    return this.prisma.projectExpense.findMany({
      where: { projectId },
      orderBy: { expenseDate: 'desc' },
    });
  }

  async createTimeTracker(data: any) {
    return this.prisma.timeTracker.create({ data });
  }

  async stopTimeTracker(id: string, endTime: Date, durationSec: number) {
    return this.prisma.timeTracker.update({
      where: { id },
      data: { endTime, durationSec },
    });
  }

  async findTimeTrackersByUser(userId: string) {
    return this.prisma.timeTracker.findMany({
      where: { userId },
      include: { photos: true, task: true },
      orderBy: { startTime: 'desc' },
    });
  }

  async createTrackPhoto(data: any) {
    return this.prisma.trackPhoto.create({ data });
  }

  async submitWeeklyTimesheet(data: any) {
    return this.prisma.employeeWeeklyTimesheet.upsert({
      where: {
        userId_weekNumber_year: {
          userId: data.userId,
          weekNumber: data.weekNumber,
          year: data.year,
        },
      },
      create: data,
      update: data,
    });
  }

  async findWeeklyTimesheets(userId: string) {
    return this.prisma.employeeWeeklyTimesheet.findMany({
      where: { userId },
      orderBy: { year: 'desc' },
    });
  }

  async createBug(data: any) {
    return this.prisma.bug.create({ data, include: { status: true } });
  }

  async findBugs() {
    return this.prisma.bug.findMany({
      include: { status: true, comments: true, files: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBugById(id: string) {
    return this.prisma.bug.findUnique({
      where: { id },
      include: { status: true, comments: true, files: true },
    });
  }

  async updateBug(id: string, data: Record<string, any>) {
    return this.prisma.bug.update({ where: { id }, data, include: { status: true } });
  }

  async createBugComment(data: any) {
    return this.prisma.bugComment.create({ data });
  }

  async findBugStatuses() {
    return this.prisma.bugStatus.findMany({ orderBy: { displayOrder: 'asc' } });
  }

  async createBugStatus(data: any) {
    return this.prisma.bugStatus.create({ data });
  }
}
