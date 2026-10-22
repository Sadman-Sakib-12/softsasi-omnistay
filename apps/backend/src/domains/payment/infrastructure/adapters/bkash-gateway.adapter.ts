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
export class BkashGatewayAdapter implements IPaymentGatewayStrategy {
  readonly gatewayCode = 'bkash';

  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly repo: IPaymentRepository,
  ) {}

  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const paymentId = `BKASH-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    await this.repo.createBkashTx({
      paymentId,
      amount: req.amount,
      status: 'Initiated',
    });

    return {
      gateway: this.gatewayCode,
      transactionId: paymentId,
      status: 'requires_action',
      redirectUrl: `https://checkout.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout?paymentID=${paymentId}`,
      amount: req.amount,
      currency: req.currency || 'BDT',
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerifyResponse> {
    const record = await this.repo.findBkashTx(transactionId);
    if (!record) {
      return {
        gateway: this.gatewayCode,
        transactionId,
        isVerified: false,
        amount: 0,
        currency: 'BDT',
        status: 'failed',
      };
    }

    const trxId = `TRX${Date.now()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    await this.repo.updateBkashTx(transactionId, {
      status: 'Completed',
      trxId,
    });

    return {
      gateway: this.gatewayCode,
      transactionId,
      isVerified: true,
      amount: Number(record.amount),
      currency: 'BDT',
      status: 'paid',
    };
  }

  async handleWebhookCallback(payload: any): Promise<{ isProcessed: boolean; eventType: string }> {
    const eventType = payload.transactionStatus || 'Completed';
    const paymentId = payload.paymentID || 'BKASH-SIM';

    await this.repo.recordWebhook({
      gatewayCode: this.gatewayCode,
      eventType,
      payload,
      isProcessed: true,
    });

    if (payload.transactionStatus === 'Completed') {
      const exists = await this.repo.findBkashTx(paymentId);
      if (exists) {
        await this.repo.updateBkashTx(paymentId, { status: 'Completed', trxId: payload.trxID });
      }
    }

    return { isProcessed: true, eventType };
  }

  async processRefund(req: PaymentRefundRequest): Promise<PaymentRefundResponse> {
    const refundId = `bk_ref_${crypto.randomBytes(6).toString('hex')}`;
    return {
      gateway: this.gatewayCode,
      refundId,
      status: 'succeeded',
      amountRefunded: req.amount || 0,
    };
  }
}
