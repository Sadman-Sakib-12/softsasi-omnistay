import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { IProjectRepository } from '../../domain/repositories/project.repository.interface.js';
import { PROJECT_REPOSITORY_TOKEN } from '../../domain/repositories/project.repository.interface.js';
import {
  StartTimeTrackerDto,
  StopTimeTrackerDto,
  SubmitWeeklyTimesheetDto,
} from '../../presentation/dto/project.dto.js';

@Injectable()
export class TimesheetService {
  constructor(
    @Inject(PROJECT_REPOSITORY_TOKEN)
    private readonly repo: IProjectRepository,
  ) {}

  async startTracking(userId: string, dto: StartTimeTrackerDto) {
    return this.repo.createTimeTracker({
      taskId: dto.taskId,
      userId,
      startTime: new Date(),
      isBillable: dto.isBillable ?? true,
    });
  }

  async stopTracking(trackerId: string, dto: StopTimeTrackerDto) {
    const endTime = new Date();
    // Default 1 hour simulation if just clicked or calculate diff
    const durationSec = 3600;

    const updated = await this.repo.stopTimeTracker(trackerId, endTime, durationSec);

    if (dto.photoUrl) {
      await this.repo.createTrackPhoto({
        trackerId,
        photoUrl: dto.photoUrl,
      });
    }

    return {
      message: 'Time tracker stopped and work duration recorded',
      tracker: updated,
      proofPhotoCaptured: !!dto.photoUrl,
    };
  }

  async getUserTimeLogs(userId: string) {
    return this.repo.findTimeTrackersByUser(userId);
  }

  async submitWeeklyTimesheet(userId: string, dto: SubmitWeeklyTimesheetDto) {
    if (dto.totalHours <= 0) {
      throw new BadRequestException('Weekly hours must be strictly greater than zero');
    }

    return this.repo.submitWeeklyTimesheet({
      userId,
      weekNumber: dto.weekNumber,
      year: dto.year,
      totalHours: dto.totalHours,
      status: 'submitted',
    });
  }

  async getWeeklyTimesheets(userId: string) {
    return this.repo.findWeeklyTimesheets(userId);
  }
}
