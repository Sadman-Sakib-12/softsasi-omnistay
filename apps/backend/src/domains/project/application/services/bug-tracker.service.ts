import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProjectRepository } from '../../domain/repositories/project.repository.interface.js';
import { PROJECT_REPOSITORY_TOKEN } from '../../domain/repositories/project.repository.interface.js';
import { AddBugCommentDto, CreateBugDto, UpdateBugStatusDto } from '../../presentation/dto/project.dto.js';

@Injectable()
export class BugTrackerService {
  constructor(
    @Inject(PROJECT_REPOSITORY_TOKEN)
    private readonly repo: IProjectRepository,
  ) {}

  async createBug(userId: string, dto: CreateBugDto) {
    let statuses = await this.repo.findBugStatuses();
    if (statuses.length === 0) {
      await this.repo.createBugStatus({ name: 'New', displayOrder: 1 });
      await this.repo.createBugStatus({ name: 'In Progress', displayOrder: 2 });
      await this.repo.createBugStatus({ name: 'Resolved', displayOrder: 3 });
      await this.repo.createBugStatus({ name: 'Closed', displayOrder: 4 });
      statuses = await this.repo.findBugStatuses();
    }

    const initialStatus = statuses.find((s) => s.name === 'New') || statuses[0];

    return this.repo.createBug({
      title: dto.title,
      description: dto.description,
      severity: dto.severity || 'normal',
      priority: dto.priority || 'normal',
      statusId: initialStatus.id,
      reportedBy: userId,
      assignedTo: dto.assignedTo,
    });
  }

  async listBugs() {
    return this.repo.findBugs();
  }

  async getBug(id: string) {
    const bug = await this.repo.findBugById(id);
    if (!bug) throw new NotFoundException('Bug defect ticket not found');
    return bug;
  }

  async updateStatus(id: string, dto: UpdateBugStatusDto) {
    await this.getBug(id);

    return this.repo.updateBug(id, {
      statusId: dto.statusId,
      updatedAt: new Date(),
    });
  }

  async addComment(id: string, userId: string, dto: AddBugCommentDto) {
    await this.getBug(id);

    return this.repo.createBugComment({
      bugId: id,
      userId,
      comment: dto.comment,
    });
  }

  async getStatuses() {
    return this.repo.findBugStatuses();
  }
}
