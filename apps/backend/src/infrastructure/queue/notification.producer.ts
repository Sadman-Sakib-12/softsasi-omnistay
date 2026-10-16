import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { RedisService } from '../redis/redis.service.js';
import {
  JOB_NAMES,
  PasswordResetJobPayload,
  QUEUE_NAMES,
  TwoFactorAlertJobPayload,
} from './queue.constants.js';

@Injectable()
export class NotificationProducer implements OnModuleDestroy {
  private readonly logger = new Logger(NotificationProducer.name);
  private queue: Queue | null = null;

  constructor(private readonly redisService: RedisService) {}

  private getQueue(): Queue | null {
    if (!this.redisService.isReady()) {
      return null;
    }
    if (!this.queue) {
      this.queue = new Queue(QUEUE_NAMES.NOTIFICATION, {
        connection: this.redisService.getConnectionOptions() as any,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: {
            age: 3600, // keep completed jobs for 1 hour
            count: 100,
          },
          removeOnFail: {
            age: 86400, // keep failed jobs for 24 hours for audit/inspection
            count: 500,
          },
        },
      });
    }
    return this.queue;
  }

  async sendPasswordResetEmail(payload: PasswordResetJobPayload): Promise<any> {
    const queue = this.getQueue();
    if (!queue) {
      this.logger.warn(
        `Redis offline: notification queue unavailable. Password reset email queued to console for user ${payload.userId}`,
      );
      return null;
    }

    try {
      return await queue.add(JOB_NAMES.NOTIFICATION_PASSWORD_RESET, payload, {
        jobId: `pwd-reset:${payload.userId}:${Date.now()}`,
      });
    } catch (err: any) {
      this.logger.error(`Failed to submit password reset job: ${err.message}`);
      return null;
    }
  }

  async sendTwoFactorAlert(payload: TwoFactorAlertJobPayload): Promise<any> {
    const queue = this.getQueue();
    if (!queue) {
      this.logger.warn(`Redis offline: notification queue unavailable for 2FA alert user ${payload.userId}`);
      return null;
    }

    try {
      return await queue.add(JOB_NAMES.NOTIFICATION_2FA_ALERT, payload, {
        jobId: `2fa-alert:${payload.userId}:${Date.now()}`,
      });
    } catch (err: any) {
      this.logger.error(`Failed to submit 2FA alert job: ${err.message}`);
      return null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.queue) {
      await this.queue.close();
      this.queue = null;
    }
  }
}
