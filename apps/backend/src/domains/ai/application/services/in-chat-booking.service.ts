import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { IAiRepository } from '../../domain/repositories/ai.repository.interface.js';
import { AI_REPOSITORY_TOKEN } from '../../domain/repositories/ai.repository.interface.js';
import {
  InChatBookingRequest,
  InChatBookingResult,
} from '@omnistay/shared-types';

@Injectable()
export class InChatBookingService {
  constructor(
    @Inject(AI_REPOSITORY_TOKEN)
    private readonly aiRepo: IAiRepository,
  ) {}

  async initiateInChatBooking(req: InChatBookingRequest): Promise<InChatBookingResult> {
    if (!req.conversationId || !req.roomTypeId || !req.checkInDate || !req.checkOutDate) {
      throw new BadRequestException('Incomplete booking parameters for in-chat checkout.');
    }

    const checkIn = new Date(req.checkInDate);
    const checkOut = new Date(req.checkOutDate);
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

    // Simulated room rate calculation (in a real integration, calls hotel rate service)
    const nightlyRate = 220.0;
    const totalAmount = Math.round(nightlyRate * nights * 100) / 100;

    // Generate unique booking code and transaction ID
    const bookingCode = `CHAT-${randomBytes(4).toString('hex').toUpperCase()}`;
    const paymentToken = `tok_inchat_${randomBytes(12).toString('hex')}`;

    // Record in-chat transaction
    const transaction = await this.aiRepo.createInChatTransaction({
      conversationId: req.conversationId,
      amount: totalAmount,
      status: 'pending_payment',
    });

    // Also record a system message in conversation thread
    await this.aiRepo.addConversationMessage({
      conversationId: req.conversationId,
      sender: 'system',
      content: `In-chat checkout generated for ${nights} night(s). Amount: $${totalAmount}. Reservation Code: ${bookingCode}`,
      metadata: {
        transactionId: transaction.id,
        bookingCode,
        amount: totalAmount,
        paymentToken,
      },
    });

    return {
      transactionId: transaction.id,
      bookingId: transaction.id, // Using transaction id as anchor
      bookingCode,
      amount: totalAmount,
      status: 'pending_payment',
      paymentToken,
      confirmationVoucherUrl: `/api/v1/travel/vouchers/${bookingCode}`,
    };
  }

  async confirmInChatPayment(transactionId: string): Promise<any> {
    const tx = await this.aiRepo.findInChatTransaction(transactionId);
    if (!tx) {
      throw new BadRequestException('Transaction not found.');
    }

    const updated = await this.aiRepo.updateInChatTransaction(transactionId, {
      status: 'completed',
    });

    await this.aiRepo.addConversationMessage({
      conversationId: tx.conversationId,
      sender: 'agent',
      content: 'Payment confirmed successfully! Your digital travel voucher and keycard are ready.',
      metadata: {
        status: 'completed',
        transactionId,
      },
    });

    return updated;
  }
}
