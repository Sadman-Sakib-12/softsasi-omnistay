import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { ICommunicationRepository } from '../../domain/repositories/communication.repository.interface.js';
import { COMMUNICATION_REPOSITORY_TOKEN } from '../../domain/repositories/communication.repository.interface.js';
import { sanitizeChatMessage } from '../../domain/rules/template-engine.rule.js';
import { SendMessageRequest } from '@omnistay/shared-types';

@Injectable()
export class ChatService {
  constructor(
    @Inject(COMMUNICATION_REPOSITORY_TOKEN)
    private readonly commRepo: ICommunicationRepository,
  ) {}

  async sendMessage(req: SendMessageRequest) {
    if (!req.body || req.body.trim().length === 0) {
      throw new BadRequestException('Message body cannot be empty.');
    }

    if (!req.toId && !req.channelId) {
      throw new BadRequestException('Message must specify either a recipient (toId) or a channel (channelId).');
    }

    const cleanBody = sanitizeChatMessage(req.body);

    return this.commRepo.createChatMessage({
      fromId: req.fromId,
      toId: req.toId || null,
      channelId: req.channelId || null,
      body: cleanBody,
      attachment: req.attachment || null,
      isSeen: false,
    });
  }

  async getDirectMessages(userId1: string, userId2: string, limit: number = 50) {
    return this.commRepo.findChatMessagesBetween(userId1, userId2, limit);
  }

  async getChannelMessages(channelId: string, limit: number = 50) {
    return this.commRepo.findChannelMessages(channelId, limit);
  }

  async markAsSeen(messageIds: string[]) {
    return this.commRepo.markMessagesAsSeen(messageIds);
  }

  async createChannel(tenantId: string, data: { channelName: string; isPrivate?: boolean; creatorId?: string }) {
    const channel = await this.commRepo.createChannel({
      tenantId,
      channelName: data.channelName,
      isPrivate: data.isPrivate ?? false,
    });

    if (data.creatorId) {
      await this.commRepo.addChannelMember(channel.id, data.creatorId, 'admin');
    }

    return channel;
  }

  async getChannels(tenantId: string) {
    return this.commRepo.findChannels(tenantId);
  }

  async joinChannel(channelId: string, userId: string, role: string = 'member') {
    return this.commRepo.addChannelMember(channelId, userId, role);
  }

  async getChannelMembers(channelId: string) {
    return this.commRepo.getChannelMembers(channelId);
  }
}
