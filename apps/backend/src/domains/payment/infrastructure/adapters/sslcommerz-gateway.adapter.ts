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
export class SslcommerzGatewayAdapter implements IPaymentGatewayStrategy {
  readonly gatewayCode = 'sslcommerz';

  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly repo: IPaymentRepository,
  ) {}

  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const tranId = `SSLCZ_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    await this.repo.createSslcommerzTx({
      tranId,
      amount: req.amount,
      status: 'PENDING',
    });

    return {
      gateway: this.gatewayCode,
      transactionId: tranId,
      status: 'requires_action',
      redirectUrl: `https://sandbox.sslcommerz.com/EasyCheckOut/testbox?sessionkey=${tranId}`,
      amount: req.amount,
      currency: req.currency || 'BDT',
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerifyResponse> {
    const record = await this.repo.findSslcommerzTx(transactionId);
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

    await this.repo.updateSslcommerzTx(transactionId, {
      status: 'VALID',
      valId: `VAL-${Date.now()}`,
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
    const eventType = payload.status || 'IPN_VALID';
    const tranId = payload.tran_id || 'SSLCZ_SIM';

    await this.repo.recordWebhook({
      gatewayCode: this.gatewayCode,
      eventType,
      payload,
      isProcessed: true,
    });

    if (payload.status === 'VALID' || payload.status === 'VALIDATED') {
      const exists = await this.repo.findSslcommerzTx(tranId);
      if (exists) {
        await this.repo.updateSslcommerzTx(tranId, { status: 'VALID', valId: payload.val_id });
      }
    }

    return { isProcessed: true, eventType };
  }

  async processRefund(req: PaymentRefundRequest): Promise<PaymentRefundResponse> {
    const refundId = `ssl_ref_${crypto.randomBytes(6).toString('hex')}`;
    return {
      gateway: this.gatewayCode,
      refundId,
      status: 'succeeded',
      amountRefunded: req.amount || 0,
    };
  }
}
