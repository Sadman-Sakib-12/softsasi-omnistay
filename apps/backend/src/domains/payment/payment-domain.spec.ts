import { describe, expect, it } from 'vitest';
import { IPaymentRepository } from './domain/repositories/payment.repository.interface.js';
import { StripeGatewayAdapter } from './infrastructure/adapters/stripe-gateway.adapter.js';
import { PaypalGatewayAdapter } from './infrastructure/adapters/paypal-gateway.adapter.js';
import { SslcommerzGatewayAdapter } from './infrastructure/adapters/sslcommerz-gateway.adapter.js';
import { BkashGatewayAdapter } from './infrastructure/adapters/bkash-gateway.adapter.js';
import { RazorpayGatewayAdapter } from './infrastructure/adapters/razorpay-gateway.adapter.js';
import { PaymentOrchestratorService } from './application/services/payment-orchestrator.service.js';

describe('Chapter 18: Global Payment Gateways Integration (Strategy Pattern)', () => {
  const mockStripeIntents: any[] = [];
  const mockPaypalOrders: any[] = [];
  const mockSslTxs: any[] = [];
  const mockBkashTxs: any[] = [];
  const mockWebhooks: any[] = [];
  const mockSlips: any[] = [];

  const mockRepo: IPaymentRepository = {
    async findGatewayConfigs() {
      return [];
    },
    async findGatewayConfig() {
      return null;
    },
    async createOrUpdateGatewayConfig(data) {
      return data;
    },
    async recordWebhook(data) {
      mockWebhooks.push(data);
      return data;
    },
    async createStripePaymentIntent(data) {
      mockStripeIntents.push(data);
      return data;
    },
    async findStripePaymentIntent(intentId) {
      return mockStripeIntents.find((i) => i.intentId === intentId) || null;
    },
    async updateStripePaymentIntent(intentId, status) {
      const intent = mockStripeIntents.find((i) => i.intentId === intentId);
      if (intent) intent.status = status;
      return intent;
    },
    async createPaypalOrder(data) {
      mockPaypalOrders.push(data);
      return data;
    },
    async findPaypalOrder(orderId) {
      return mockPaypalOrders.find((o) => o.orderId === orderId) || null;
    },
    async updatePaypalOrder(orderId, status) {
      const order = mockPaypalOrders.find((o) => o.orderId === orderId);
      if (order) order.status = status;
      return order;
    },
    async createSslcommerzTx(data) {
      mockSslTxs.push(data);
      return data;
    },
    async findSslcommerzTx(tranId) {
      return mockSslTxs.find((t) => t.tranId === tranId) || null;
    },
    async updateSslcommerzTx(tranId, data) {
      const tx = mockSslTxs.find((t) => t.tranId === tranId);
      if (tx) Object.assign(tx, data);
      return tx;
    },
    async createBkashTx(data) {
      mockBkashTxs.push(data);
      return data;
    },
    async findBkashTx(paymentId) {
      return mockBkashTxs.find((b) => b.paymentId === paymentId) || null;
    },
    async updateBkashTx(paymentId, data) {
      const tx = mockBkashTxs.find((b) => b.paymentId === paymentId);
      if (tx) Object.assign(tx, data);
      return tx;
    },
    async createOfflineBankSlip(data) {
      const slip = { id: `slip-${Date.now()}`, ...data, isApproved: false, submittedAt: new Date() };
      mockSlips.push(slip);
      return slip;
    },
    async findOfflineBankSlips(bookingId) {
      return bookingId ? mockSlips.filter((s) => s.bookingId === bookingId) : mockSlips;
    },
    async approveOfflineBankSlip(id, approvedBy) {
      const slip = mockSlips.find((s) => s.id === id);
      if (slip) {
        slip.isApproved = true;
        slip.approvedBy = approvedBy;
      }
      return slip;
    },
  };

  const stripe = new StripeGatewayAdapter(mockRepo);
  const paypal = new PaypalGatewayAdapter(mockRepo);
  const sslcz = new SslcommerzGatewayAdapter(mockRepo);
  const bkash = new BkashGatewayAdapter(mockRepo);
  const razorpay = new RazorpayGatewayAdapter(mockRepo);
  const orchestrator = new PaymentOrchestratorService(mockRepo, stripe, paypal, sslcz, bkash, razorpay);

  it('18.1: should list supported regional and global gateways', async () => {
    const gateways = await orchestrator.listSupportedGateways();
    expect(gateways.length).toBeGreaterThanOrEqual(6);
    expect(gateways.map((g) => g.code)).toContain('stripe');
    expect(gateways.map((g) => g.code)).toContain('bkash');
    expect(gateways.map((g) => g.code)).toContain('sslcommerz');
  });

  it('18.2: should dynamically initiate and verify payment via Stripe strategy', async () => {
    const res = await orchestrator.initiatePayment('stripe', {
      bookingId: 'bk-101',
      amount: 450.0,
      currency: 'USD',
      customerEmail: 'guest@hotel.com',
    });
    expect(res.gateway).toBe('stripe');
    expect(res.transactionId).toMatch(/^pi_/);
    expect(res.clientSecret).toContain(res.transactionId);

    const verified = await orchestrator.verifyPayment('stripe', res.transactionId);
    expect(verified.isVerified).toBe(true);
    expect(verified.status).toBe('paid');
  });

  it('18.2: should dynamically initiate and verify payment via bKash strategy', async () => {
    const res = await orchestrator.initiatePayment('bkash', {
      bookingId: 'bk-202',
      amount: 15000.0,
      currency: 'BDT',
      customerEmail: 'sakib@softsasi.com',
    });
    expect(res.gateway).toBe('bkash');
    expect(res.transactionId).toMatch(/^BKASH-/);
    expect(res.redirectUrl).toContain('bka.sh');

    const verified = await orchestrator.verifyPayment('bkash', res.transactionId);
    expect(verified.isVerified).toBe(true);
    expect(verified.status).toBe('paid');
  });

  it('18.2: should process asynchronous webhook callbacks across gateways', async () => {
    const wh = await orchestrator.handleWebhook('stripe', {
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_webhook_1' } },
    });
    expect(wh.isProcessed).toBe(true);
    expect(wh.eventType).toBe('payment_intent.succeeded');
  });

  it('18.2: should handle manual offline wire transfer slips and approval', async () => {
    const slip = await orchestrator.submitOfflineBankSlip({
      bookingId: 'bk-303',
      bankName: 'City Bank Ltd',
      slipNumber: 'TXN-998877',
      slipFileUrl: 'https://cdn.omnistay.com/slips/slip303.pdf',
      amount: 50000,
    });
    expect(slip.slipNumber).toBe('TXN-998877');
    expect(slip.isApproved).toBe(false);

    const approved = await orchestrator.approveOfflineSlip(slip.id, 'admin-user-1');
    expect(approved.isApproved).toBe(true);
    expect(approved.approvedBy).toBe('admin-user-1');
  });
});
