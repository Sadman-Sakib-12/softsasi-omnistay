import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { ICommunicationRepository } from '../../domain/repositories/communication.repository.interface.js';
import { COMMUNICATION_REPOSITORY_TOKEN } from '../../domain/repositories/communication.repository.interface.js';
import { validatePhoneNumber } from '../../domain/rules/template-engine.rule.js';
import { SendSmsRequest } from '@omnistay/shared-types';

@Injectable()
export class SmsGatewayService {
  constructor(
    @Inject(COMMUNICATION_REPOSITORY_TOKEN)
    private readonly commRepo: ICommunicationRepository,
  ) {}

  async sendSms(req: SendSmsRequest) {
    if (!validatePhoneNumber(req.phoneTo)) {
      throw new BadRequestException(`Invalid phone number: ${req.phoneTo}. E.164 required.`);
    }

    if (!req.message || req.message.trim().length === 0) {
      throw new BadRequestException('SMS message content cannot be empty.');
    }

    const gatewayKey = req.gateway || 'twilio';
    const cost = req.isCriticalOtp ? 0.015 : 0.0075;

    // Record outbound SMS log
    return this.commRepo.createSmsLog({
      phoneTo: req.phoneTo,
      message: req.message,
      gateway: gatewayKey,
      status: 'delivered',
      cost,
    });
  }

  async configureGateway(data: {
    gatewayKey: 'twilio' | 'vonage' | 'aws_sns' | 'regional_aggregator';
    apiKey: string;
    apiSecret?: string;
    senderId?: string;
    isActive?: boolean;
  }) {
    return this.commRepo.upsertSmsGateway(data.gatewayKey, data);
  }

  async getLogs(phoneTo?: string) {
    return this.commRepo.findSmsLogs(phoneTo);
  }
}
