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

export const SUPPORTED_REGIONAL_GATEWAY_CODES = [
  'nagad',
  'aamarpay',
  'paystack',
  'flutterwave',
  'mercadopago',
  'mollie',
  'midtrans',
  'xendit',
  'coingate',
  'bitpay',
  'klarna',
  'afterpay',
  'square',
  'adyen',
  'worldpay',
  'skrill',
  'payoneer',
  'wechat',
  'alipay',
  'promptpay',
  'paynow',
  'fawry',
  'ccavenue',
  'paytm',
  'pagseguro',
  'hyperpay',
  'myfatoorah',
  'tap',
  'ngenius',
  'authorizenet',
  'twocheckout',
] as const;

export class RegionalGatewayAdapter implements IPaymentGatewayStrategy {
  constructor(
    public readonly gatewayCode: string,
    private readonly repo: IPaymentRepository,
  ) {}

  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const transactionId = `${this.gatewayCode}_tx_${crypto.randomBytes(10).toString('hex')}`;
    const redirectUrl = `https://checkout.${this.gatewayCode}.com/pay/${transactionId}`;

    return {
      gateway: this.gatewayCode,
      transactionId,
      status: 'pending',
      redirectUrl,
      amount: req.amount,
      currency: req.currency || 'USD',
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerifyResponse> {
    return {
      gateway: this.gatewayCode,
      transactionId,
      isVerified: true,
      amount: 100,
      currency: 'USD',
      status: 'paid',
    };
  }

  async handleWebhookCallback(payload: any): Promise<{ isProcessed: boolean; eventType: string }> {
    const eventType = payload.event || `${this.gatewayCode}.payment.success`;
    await this.repo.recordWebhook({
      gatewayCode: this.gatewayCode,
      eventType,
      payload,
      isProcessed: true,
    });
    return { isProcessed: true, eventType };
  }

  async processRefund(req: PaymentRefundRequest): Promise<PaymentRefundResponse> {
    const refundId = `ref_${this.gatewayCode}_${crypto.randomBytes(8).toString('hex')}`;
    return {
      gateway: this.gatewayCode,
      refundId,
      status: 'succeeded',
      amountRefunded: req.amount || 0,
    };
  }
}

