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

export const CANONICAL_GATEWAYS = [
  { code: 'stripe', name: 'Stripe (Credit/Debit, Apple Pay, Google Pay)', regional: 'Global (135+ countries)' },
  { code: 'paypal', name: 'PayPal Commerce Platform', regional: 'Global (200+ countries)' },
  { code: 'sslcommerz', name: 'SSLCommerz Session Gateway', regional: 'Bangladesh & South Asia' },
  { code: 'bkash', name: 'bKash Tokenized Direct Checkout', regional: 'Bangladesh MFS' },
  { code: 'nagad', name: 'Nagad Direct Merchant Settlement', regional: 'Bangladesh MFS' },
  { code: 'aamarpay', name: 'AamarPay Mobile & Card Gateway', regional: 'Bangladesh PGW' },
  { code: 'razorpay', name: 'Razorpay (UPI, NetBanking, Cards)', regional: 'India & South Asia' },
  { code: 'paytm', name: 'Paytm Payments Bank UPI', regional: 'India' },
  { code: 'ccavenue', name: 'CCAvenue Multi-Currency PGW', regional: 'India & Middle East' },
  { code: 'paystack', name: 'Paystack Cross-Border Africa', regional: 'Nigeria, Ghana, Kenya, South Africa' },
  { code: 'flutterwave', name: 'Flutterwave Barter & MoMo', regional: 'Pan-African & Global' },
  { code: 'mercadopago', name: 'MercadoPago Pix & Boleto', regional: 'Brazil, Argentina, Mexico' },
  { code: 'pagseguro', name: 'PagSeguro / PagBank Pix', regional: 'Brazil' },
  { code: 'mollie', name: 'Mollie (iDEAL, Bancontact, Sofort)', regional: 'Europe & UK' },
  { code: 'klarna', name: 'Klarna BNPL (Slice in 3/4)', regional: 'Europe, US & UK' },
  { code: 'afterpay', name: 'Afterpay / Clearpay 4-Pay', regional: 'US, UK, Australia' },
  { code: 'midtrans', name: 'Midtrans SNAP (GoPay, ShopeePay)', regional: 'Indonesia & SE Asia' },
  { code: 'xendit', name: 'Xendit (OVO, DANA, QRIS)', regional: 'Philippines, Indonesia, Vietnam' },
  { code: 'promptpay', name: 'PromptPay National QR', regional: 'Thailand' },
  { code: 'paynow', name: 'PayNow SGQR FAST Clearing', regional: 'Singapore' },
  { code: 'fawry', name: 'FawryPay Cash Kiosks & Wallet', regional: 'Egypt & MENA' },
  { code: 'hyperpay', name: 'HyperPay Mada & Sadad', regional: 'Saudi Arabia & GCC' },
  { code: 'myfatoorah', name: 'MyFatoorah KNET & GCC Debit', regional: 'Kuwait & GCC' },
  { code: 'tap', name: 'Tap Payments Benefit & Mada', regional: 'GCC & Middle East' },
  { code: 'ngenius', name: 'N-Genius Network International', regional: 'UAE & Middle East' },
  { code: 'authorizenet', name: 'Authorize.Net SIM/DPM', regional: 'North America & Europe' },
  { code: 'twocheckout', name: '2Checkout / Verifone Global', regional: 'Global (100+ countries)' },
  { code: 'adyen', name: 'Adyen Omnichannel & POS', regional: 'Global Enterprise' },
  { code: 'worldpay', name: 'Worldpay / FIS Merchant', regional: 'Global Enterprise' },
  { code: 'square', name: 'Square Payments Terminal', regional: 'US, Canada, UK, Australia' },
  { code: 'skrill', name: 'Skrill Global Digital Wallet', regional: 'Global Digital Wallet' },
  { code: 'payoneer', name: 'Payoneer Cross-Border B2B', regional: 'Global B2B Marketplace' },
  { code: 'wechat', name: 'WeChat Pay QR & In-App', regional: 'China & Cross-Border' },
  { code: 'alipay', name: 'Alipay Ant Financial Barcode', regional: 'China & Cross-Border' },
  { code: 'coingate', name: 'CoinGate Crypto (BTC, ETH, USDT)', regional: 'Web3 & Decentralized' },
  { code: 'bitpay', name: 'BitPay Cryptocurrency POS', regional: 'Web3 & Decentralized' },
  { code: 'offline_bank', name: 'Manual Wire Transfer & Slip Verification', regional: 'Global' },
];

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
    let configs = await this.repo.findGatewayConfigs();
    if (!configs || configs.length === 0) {
      for (const gw of CANONICAL_GATEWAYS) {
        await this.repo.createOrUpdateGatewayConfig({
          gatewayCode: gw.code,
          name: gw.name,
          supportedModes: [gw.regional],
          isEnabled: true,
          isTestMode: false,
        });
      }
      configs = await this.repo.findGatewayConfigs();
    }

    return configs.map((c) => ({
      code: c.gatewayCode,
      name: c.name,
      regional: Array.isArray(c.supportedModes) && c.supportedModes.length > 0 ? c.supportedModes[0] : 'Global',
      status: c.isEnabled ? 'ACTIVE' : 'INACTIVE',
      isTestMode: c.isTestMode,
    }));
  }
}
