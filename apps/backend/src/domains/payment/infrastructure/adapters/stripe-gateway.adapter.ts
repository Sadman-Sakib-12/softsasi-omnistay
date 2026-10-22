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
export class StripeGatewayAdapter implements IPaymentGatewayStrategy {
  readonly gatewayCode = 'stripe';

  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly repo: IPaymentRepository,
  ) {}

  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const intentId = `pi_${crypto.randomBytes(12).toString('hex')}`;
    const clientSecret = `${intentId}_secret_${crypto.randomBytes(8).toString('hex')}`;

    await this.repo.createStripePaymentIntent({
      intentId,
      amount: req.amount,
      currency: req.currency || 'USD',
      clientSecret,
      status: 'requires_payment_method',
    });

    return {
      gateway: this.gatewayCode,
      transactionId: intentId,
      status: 'requires_action',
      clientSecret,
      amount: req.amount,
      currency: req.currency || 'USD',
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerifyResponse> {
    const record = await this.repo.findStripePaymentIntent(transactionId);
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

    await this.repo.updateStripePaymentIntent(transactionId, 'succeeded');

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
    const eventType = payload.type || 'payment_intent.succeeded';
    const intentId = payload.data?.object?.id || 'pi_simulated';

    await this.repo.recordWebhook({
      gatewayCode: this.gatewayCode,
      eventType,
      payload,
      isProcessed: true,
    });

    if (eventType === 'payment_intent.succeeded') {
      const exists = await this.repo.findStripePaymentIntent(intentId);
      if (exists) {
        await this.repo.updateStripePaymentIntent(intentId, 'succeeded');
      }
    }

    return { isProcessed: true, eventType };
  }

  async processRefund(req: PaymentRefundRequest): Promise<PaymentRefundResponse> {
    const refundId = `re_${crypto.randomBytes(12).toString('hex')}`;
    return {
      gateway: this.gatewayCode,
      refundId,
      status: 'succeeded',
      amountRefunded: req.amount || 0,
    };
  }
}
