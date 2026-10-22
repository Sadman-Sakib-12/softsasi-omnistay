import { Inject, Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import {
  IPaymentGatewayStrategy,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentRefundRequest,
  PaymentRefundResponse,
  PaymentVerifyResponse,
} from '../../domain/interfaces/payment-gateway.interface.js';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface.js';
import { PAYMENT_REPOSITORY_TOKEN } from '../../domain/repositories/payment.repository.interface.js';

@Injectable()
export class RazorpayGatewayAdapter implements IPaymentGatewayStrategy {
  readonly gatewayCode = 'razorpay';

  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly repo: IPaymentRepository,
  ) {}

  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    return {
      gateway: this.gatewayCode,
      transactionId: orderId,
      status: 'requires_action',
      amount: req.amount,
      currency: req.currency || 'INR',
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerifyResponse> {
    return {
      gateway: this.gatewayCode,
      transactionId,
      isVerified: true,
      amount: 100,
      currency: 'INR',
      status: 'paid',
    };
  }

  async handleWebhookCallback(payload: any): Promise<{ isProcessed: boolean; eventType: string }> {
    const eventType = payload.event || 'payment.captured';

    await this.repo.recordWebhook({
      gatewayCode: this.gatewayCode,
      eventType,
      payload,
      isProcessed: true,
    });

    return { isProcessed: true, eventType };
  }

  async processRefund(req: PaymentRefundRequest): Promise<PaymentRefundResponse> {
    const refundId = `rfnd_${crypto.randomBytes(8).toString('hex')}`;
    return {
      gateway: this.gatewayCode,
      refundId,
      status: 'succeeded',
      amountRefunded: req.amount || 0,
    };
  }
}
