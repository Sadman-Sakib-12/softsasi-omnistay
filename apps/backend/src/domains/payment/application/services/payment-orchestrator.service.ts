import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IPaymentGatewayStrategy,
  PaymentInitiateRequest,
  PaymentRefundRequest,
} from '../../domain/interfaces/payment-gateway.interface.js';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface.js';
import { PAYMENT_REPOSITORY_TOKEN } from '../../domain/repositories/payment.repository.interface.js';
import { StripeGatewayAdapter } from '../../infrastructure/adapters/stripe-gateway.adapter.js';
import { PaypalGatewayAdapter } from '../../infrastructure/adapters/paypal-gateway.adapter.js';
import { SslcommerzGatewayAdapter } from '../../infrastructure/adapters/sslcommerz-gateway.adapter.js';
import { BkashGatewayAdapter } from '../../infrastructure/adapters/bkash-gateway.adapter.js';
import { RazorpayGatewayAdapter } from '../../infrastructure/adapters/razorpay-gateway.adapter.js';

@Injectable()
export class PaymentOrchestratorService {
  private readonly strategies = new Map<string, IPaymentGatewayStrategy>();

  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly repo: IPaymentRepository,
    stripeAdapter: StripeGatewayAdapter,
    paypalAdapter: PaypalGatewayAdapter,
    sslcommerzAdapter: SslcommerzGatewayAdapter,
    bkashAdapter: BkashGatewayAdapter,
    razorpayAdapter: RazorpayGatewayAdapter,
  ) {
    this.strategies.set(stripeAdapter.gatewayCode, stripeAdapter);
    this.strategies.set(paypalAdapter.gatewayCode, paypalAdapter);
    this.strategies.set(sslcommerzAdapter.gatewayCode, sslcommerzAdapter);
    this.strategies.set(bkashAdapter.gatewayCode, bkashAdapter);
    this.strategies.set(razorpayAdapter.gatewayCode, razorpayAdapter);
  }

  getStrategy(gatewayCode: string): IPaymentGatewayStrategy {
    const strategy = this.strategies.get(gatewayCode.toLowerCase());
    if (!strategy) {
      throw new BadRequestException(
        `Payment gateway '${gatewayCode}' is not supported. Supported: ${Array.from(this.strategies.keys()).join(', ')}`,
      );
    }
    return strategy;
  }

  async initiatePayment(gatewayCode: string, req: PaymentInitiateRequest) {
    const strategy = this.getStrategy(gatewayCode);
    return strategy.initiatePayment(req);
  }

  async verifyPayment(gatewayCode: string, transactionId: string) {
    const strategy = this.getStrategy(gatewayCode);
    return strategy.verifyPayment(transactionId);
  }

  async handleWebhook(gatewayCode: string, payload: any) {
    const strategy = this.getStrategy(gatewayCode);
    return strategy.handleWebhookCallback(payload);
  }

  async processRefund(gatewayCode: string, req: PaymentRefundRequest) {
    const strategy = this.getStrategy(gatewayCode);
    return strategy.processRefund(req);
  }

  async submitOfflineBankSlip(dto: { bookingId: string; bankName: string; slipNumber: string; slipFileUrl: string; amount: number }) {
    return this.repo.createOfflineBankSlip(dto);
  }

  async approveOfflineSlip(slipId: string, approvedBy: string) {
    return this.repo.approveOfflineBankSlip(slipId, approvedBy);
  }

  async listOfflineSlips(bookingId?: string) {
    return this.repo.findOfflineBankSlips(bookingId);
  }

  async listSupportedGateways() {
    return [
      { code: 'stripe', name: 'Stripe (Credit/Debit, Apple Pay, Google Pay)', regional: 'Global (135+ countries)', status: 'ACTIVE' },
      { code: 'paypal', name: 'PayPal Commerce Platform', regional: 'Global (200+ countries)', status: 'ACTIVE' },
      { code: 'sslcommerz', name: 'SSLCommerz Session Gateway', regional: 'Bangladesh & South Asia', status: 'ACTIVE' },
      { code: 'bkash', name: 'bKash Tokenized Direct Checkout', regional: 'Bangladesh MFS', status: 'ACTIVE' },
      { code: 'razorpay', name: 'Razorpay (UPI, NetBanking, Cards)', regional: 'India & South Asia', status: 'ACTIVE' },
      { code: 'offline_bank', name: 'Manual Wire Transfer & Slip Verification', regional: 'Global', status: 'ACTIVE' },
    ];
  }
}
