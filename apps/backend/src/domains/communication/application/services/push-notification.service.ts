import { Inject, Injectable } from '@nestjs/common';
import type { ICommunicationRepository } from '../../domain/repositories/communication.repository.interface.js';
import { COMMUNICATION_REPOSITORY_TOKEN } from '../../domain/repositories/communication.repository.interface.js';
import { SendPushNotificationRequest } from '@omnistay/shared-types';

@Injectable()
export class PushNotificationService {
  constructor(
    @Inject(COMMUNICATION_REPOSITORY_TOKEN)
    private readonly commRepo: ICommunicationRepository,
  ) {}

  async subscribe(userId: string, data: {
    endpoint: string;
    authKey: string;
    p256dhKey: string;
  }) {
    return this.commRepo.upsertPushSubscription(userId, data);
  }

  async sendNotification(req: SendPushNotificationRequest) {
    return this.commRepo.createPushNotification({
      userId: req.userId,
      title: req.title,
      body: req.body,
      isRead: false,
    });
  }

  async getUserNotifications(userId: string) {
    return this.commRepo.findPushNotifications(userId);
  }

  async markAsRead(id: string) {
    return this.commRepo.markPushNotificationAsRead(id);
  }
}
