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
export class PaypalGatewayAdapter implements IPaymentGatewayStrategy {
  readonly gatewayCode = 'paypal';

  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly repo: IPaymentRepository,
  ) {}

  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const orderId = `PAYPAL-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    await this.repo.createPaypalOrder({
      orderId,
      amount: req.amount,
      currency: req.currency || 'USD',
      status: 'CREATED',
    });

    return {
      gateway: this.gatewayCode,
      transactionId: orderId,
      status: 'requires_action',
      redirectUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
      amount: req.amount,
      currency: req.currency || 'USD',
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerifyResponse> {
    const record = await this.repo.findPaypalOrder(transactionId);
    if (!record) {
      return {
        gateway: this.gatewayCode,
        transactionId,
        isVerified: false,
        amount: 0,
        currency: 'USD',
        status: 'failed',
      };
    }

    await this.repo.updatePaypalOrder(transactionId, 'COMPLETED');

    return {
      gateway: this.gatewayCode,
      transactionId,
      isVerified: true,
      amount: Number(record.amount),
      currency: record.currency,
      status: 'paid',
    };
  }

  async handleWebhookCallback(payload: any): Promise<{ isProcessed: boolean; eventType: string }> {
    const eventType = payload.event_type || 'PAYMENT.CAPTURE.COMPLETED';
    const orderId = payload.resource?.id || 'PAYPAL-SIM';

    await this.repo.recordWebhook({
      gatewayCode: this.gatewayCode,
      eventType,
      payload,
      isProcessed: true,
    });

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const exists = await this.repo.findPaypalOrder(orderId);
      if (exists) {
        await this.repo.updatePaypalOrder(orderId, 'COMPLETED');
      }
    }

    return { isProcessed: true, eventType };
  }

  async processRefund(req: PaymentRefundRequest): Promise<PaymentRefundResponse> {
    const refundId = `pp_ref_${crypto.randomBytes(8).toString('hex')}`;
    return {
      gateway: this.gatewayCode,
      refundId,
      status: 'succeeded',
      amountRefunded: req.amount || 0,
    };
  }
}
