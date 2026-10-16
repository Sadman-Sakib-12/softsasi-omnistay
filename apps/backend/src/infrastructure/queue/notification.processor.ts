import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { RedisService } from '../redis/redis.service.js';
import {
  JOB_NAMES,
  PasswordResetJobPayload,
  QUEUE_NAMES,
  TwoFactorAlertJobPayload,
} from './queue.constants.js';

@Injectable()
export class NotificationProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationProcessor.name);
  private worker: Worker | null = null;

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit(): Promise<void> {
    if (this.redisService.isReady()) {
      this.initWorker();
    }
  }

  private initWorker(): void {
    if (this.worker) return;

    try {
      this.worker = new Worker(
        QUEUE_NAMES.NOTIFICATION,
        async (job: Job) => {
          return await this.processJob(job);
        },
        {
          connection: this.redisService.getConnectionOptions() as any,
          concurrency: 5,
        },
      );

      this.worker.on('completed', (job) => {
        this.logger.log(`Job ${job.id} (${job.name}) completed successfully.`);
      });

      this.worker.on('failed', (job, err) => {
        this.logger.error(`Job ${job?.id} (${job?.name}) failed: ${err.message}`);
      });
    } catch (err: any) {
      this.logger.warn(`Failed to initialize notification worker: ${err.message}`);
    }
  }

  async processJob(job: { id?: string; name: string; data: any }): Promise<{ processed: boolean; channel?: string }> {
    switch (job.name) {
      case JOB_NAMES.NOTIFICATION_PASSWORD_RESET: {
        const payload = job.data as PasswordResetJobPayload;
        const maskedEmail = this.maskEmail(payload.email);
        this.logger.log(`[NotificationProcessor] Processing password reset email for user ${payload.userId} (${maskedEmail})`);
        // Actual email dispatch simulation / SMTP integration here (without logging the raw token!)
        return { processed: true, channel: 'email' };
      }

      case JOB_NAMES.NOTIFICATION_2FA_ALERT: {
        const payload = job.data as TwoFactorAlertJobPayload;
        this.logger.log(`[NotificationProcessor] Security alert: 2FA ${payload.action} for user ${payload.userId}`);
        return { processed: true, channel: 'security-audit' };
      }

      default:
        this.logger.warn(`[NotificationProcessor] Unrecognized job name "${job.name}"`);
        return { processed: false };
    }
  }

  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***';
    const [user, domain] = email.split('@');
    if (user.length <= 2) {
      return `${user[0]}***@${domain}`;
    }
    return `${user[0]}***${user[user.length - 1]}@${domain}`;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }
  }
}
