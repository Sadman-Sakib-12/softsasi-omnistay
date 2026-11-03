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
import {
  RegionalGatewayAdapter,
  SUPPORTED_REGIONAL_GATEWAY_CODES,
} from '../../infrastructure/adapters/regional-gateway.adapter.js';

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
    // Primary core adapters
    this.strategies.set(stripeAdapter.gatewayCode, stripeAdapter);
    this.strategies.set(paypalAdapter.gatewayCode, paypalAdapter);
    this.strategies.set(sslcommerzAdapter.gatewayCode, sslcommerzAdapter);
    this.strategies.set(bkashAdapter.gatewayCode, bkashAdapter);
    this.strategies.set(razorpayAdapter.gatewayCode, razorpayAdapter);

    // Register all regional adapters specified in Chapter 18
    for (const code of SUPPORTED_REGIONAL_GATEWAY_CODES) {
      this.strategies.set(code, new RegionalGatewayAdapter(code, this.repo));
    }
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
      { code: 'nagad', name: 'Nagad Direct Merchant Settlement', regional: 'Bangladesh MFS', status: 'ACTIVE' },
      { code: 'aamarpay', name: 'AamarPay Mobile & Card Gateway', regional: 'Bangladesh PGW', status: 'ACTIVE' },
      { code: 'razorpay', name: 'Razorpay (UPI, NetBanking, Cards)', regional: 'India & South Asia', status: 'ACTIVE' },
      { code: 'paytm', name: 'Paytm Payments Bank UPI', regional: 'India', status: 'ACTIVE' },
      { code: 'ccavenue', name: 'CCAvenue Multi-Currency PGW', regional: 'India & Middle East', status: 'ACTIVE' },
      { code: 'paystack', name: 'Paystack Cross-Border Africa', regional: 'Nigeria, Ghana, Kenya, South Africa', status: 'ACTIVE' },
      { code: 'flutterwave', name: 'Flutterwave Barter & MoMo', regional: 'Pan-African & Global', status: 'ACTIVE' },
      { code: 'mercadopago', name: 'MercadoPago Pix & Boleto', regional: 'Brazil, Argentina, Mexico', status: 'ACTIVE' },
      { code: 'pagseguro', name: 'PagSeguro / PagBank Pix', regional: 'Brazil', status: 'ACTIVE' },
      { code: 'mollie', name: 'Mollie (iDEAL, Bancontact, Sofort)', regional: 'Europe & UK', status: 'ACTIVE' },
      { code: 'klarna', name: 'Klarna BNPL (Slice in 3/4)', regional: 'Europe, US & UK', status: 'ACTIVE' },
      { code: 'afterpay', name: 'Afterpay / Clearpay 4-Pay', regional: 'US, UK, Australia', status: 'ACTIVE' },
      { code: 'midtrans', name: 'Midtrans SNAP (GoPay, ShopeePay)', regional: 'Indonesia & SE Asia', status: 'ACTIVE' },
      { code: 'xendit', name: 'Xendit (OVO, DANA, QRIS)', regional: 'Philippines, Indonesia, Vietnam', status: 'ACTIVE' },
      { code: 'promptpay', name: 'PromptPay National QR', regional: 'Thailand', status: 'ACTIVE' },
      { code: 'paynow', name: 'PayNow SGQR FAST Clearing', regional: 'Singapore', status: 'ACTIVE' },
      { code: 'fawry', name: 'FawryPay Cash Kiosks & Wallet', regional: 'Egypt & MENA', status: 'ACTIVE' },
      { code: 'hyperpay', name: 'HyperPay Mada & Sadad', regional: 'Saudi Arabia & GCC', status: 'ACTIVE' },
      { code: 'myfatoorah', name: 'MyFatoorah KNET & GCC Debit', regional: 'Kuwait & GCC', status: 'ACTIVE' },
      { code: 'tap', name: 'Tap Payments Benefit & Mada', regional: 'GCC & Middle East', status: 'ACTIVE' },
      { code: 'ngenius', name: 'N-Genius Network International', regional: 'UAE & Middle East', status: 'ACTIVE' },
      { code: 'authorizenet', name: 'Authorize.Net SIM/DPM', regional: 'North America & Europe', status: 'ACTIVE' },
      { code: 'twocheckout', name: '2Checkout / Verifone Global', regional: 'Global (100+ countries)', status: 'ACTIVE' },
      { code: 'adyen', name: 'Adyen Omnichannel & POS', regional: 'Global Enterprise', status: 'ACTIVE' },
      { code: 'worldpay', name: 'Worldpay / FIS Merchant', regional: 'Global Enterprise', status: 'ACTIVE' },
      { code: 'square', name: 'Square Payments Terminal', regional: 'US, Canada, UK, Australia', status: 'ACTIVE' },
      { code: 'skrill', name: 'Skrill Global Digital Wallet', regional: 'Global Digital Wallet', status: 'ACTIVE' },
      { code: 'payoneer', name: 'Payoneer Cross-Border B2B', regional: 'Global B2B Marketplace', status: 'ACTIVE' },
      { code: 'wechat', name: 'WeChat Pay QR & In-App', regional: 'China & Cross-Border', status: 'ACTIVE' },
      { code: 'alipay', name: 'Alipay Ant Financial Barcode', regional: 'China & Cross-Border', status: 'ACTIVE' },
      { code: 'coingate', name: 'CoinGate Crypto (BTC, ETH, USDT)', regional: 'Web3 & Decentralized', status: 'ACTIVE' },
      { code: 'bitpay', name: 'BitPay Cryptocurrency POS', regional: 'Web3 & Decentralized', status: 'ACTIVE' },
      { code: 'offline_bank', name: 'Manual Wire Transfer & Slip Verification', regional: 'Global', status: 'ACTIVE' },
    ];
  }
}
