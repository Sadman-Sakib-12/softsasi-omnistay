import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ICommunicationRepository } from '../../domain/repositories/communication.repository.interface.js';
import { COMMUNICATION_REPOSITORY_TOKEN } from '../../domain/repositories/communication.repository.interface.js';
import { renderTemplate, validatePhoneNumber } from '../../domain/rules/template-engine.rule.js';
import { verifyHmacSignature } from '../../domain/rules/webhook-signature.rule.js';
import { SendWhatsappRequest } from '@omnistay/shared-types';

@Injectable()
export class WhatsappService {
  constructor(
    @Inject(COMMUNICATION_REPOSITORY_TOKEN)
    private readonly commRepo: ICommunicationRepository,
  ) {}

  async sendWhatsapp(req: SendWhatsappRequest) {
    if (!validatePhoneNumber(req.recipientNo)) {
      throw new BadRequestException(`Invalid recipient phone number format: ${req.recipientNo}. Must adhere to E.164.`);
    }

    let messageBody = req.customMessage || '';

    if (req.templateName) {
      const template = await this.commRepo.findWhatsappTemplateByName(req.templateName);
      if (template) {
        const rendered = renderTemplate(template.content, req.mergeVariables || {});
        messageBody = rendered.rendered;
      }
    }

    if (!messageBody) {
      throw new BadRequestException('Message body or valid template name must be provided.');
    }

    // Persist outbound WhatsApp message
    return this.commRepo.createWhatsappMessage({
      tenantId: req.tenantId,
      recipientNo: req.recipientNo,
      messageBody,
      direction: 'outbound',
      status: 'sent',
    });
  }

  async createTemplate(data: {
    name: string;
    category: 'booking_confirmation' | 'pre_arrival_checkin' | 'room_ready' | 'folio_receipt' | 'support_concierge';
    content: string;
    isApproved?: boolean;
  }) {
    return this.commRepo.createWhatsappTemplate(data);
  }

  async getMessages(tenantId: string) {
    return this.commRepo.findWhatsappMessages(tenantId);
  }

  async handleInboundWebhook(rawPayload: string, signature: string, secretKey: string, payloadObj: any) {
    const isValid = verifyHmacSignature(rawPayload, signature, secretKey);
    if (!isValid) {
      throw new UnauthorizedException('Invalid X-Softsasi-Signature on inbound WhatsApp webhook.');
    }

    const { tenantId, from, text } = payloadObj;

    return this.commRepo.createWhatsappMessage({
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      recipientNo: from || '+0000000000',
      messageBody: text || '',
      direction: 'inbound',
      status: 'delivered',
    });
  }

  // Pre-configured automated transactional triggers
  async triggerBookingConfirmation(tenantId: string, recipientNo: string, data: {
    guestName: string;
    bookingCode: string;
    propertyName: string;
    checkInDate: string;
  }) {
    const content = `Hello ${data.guestName}! Your booking ${data.bookingCode} at ${data.propertyName} is confirmed for ${data.checkInDate}. Check-in online: https://omnistay.com/checkin/${data.bookingCode}`;
    return this.sendWhatsapp({
      tenantId,
      recipientNo,
      customMessage: content,
    });
  }

  async triggerRoomReadyAlert(tenantId: string, recipientNo: string, data: {
    guestName: string;
    roomNumber: string;
    propertyName: string;
  }) {
    const content = `Great news ${data.guestName}! Room ${data.roomNumber} at ${data.propertyName} is now clean and inspected. Your digital keycard is active.`;
    return this.sendWhatsapp({
      tenantId,
      recipientNo,
      customMessage: content,
    });
  }
}
