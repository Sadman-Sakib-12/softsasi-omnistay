export const PAYMENT_REPOSITORY_TOKEN = Symbol('IPaymentRepository');

export interface IPaymentRepository {
  // Configs
  findGatewayConfigs(): Promise<any[]>;
  findGatewayConfig(code: string): Promise<any | null>;
  createOrUpdateGatewayConfig(data: { gatewayCode: string; name: string; supportedModes: string[]; isTestMode: boolean; isEnabled: boolean }): Promise<any>;

  // Webhooks
  recordWebhook(data: { gatewayCode: string; eventType: string; payload: any; isProcessed?: boolean }): Promise<any>;

  // Stripe
  createStripePaymentIntent(data: { intentId: string; amount: number; currency: string; clientSecret: string; status?: string }): Promise<any>;
  findStripePaymentIntent(intentId: string): Promise<any | null>;
  updateStripePaymentIntent(intentId: string, status: string): Promise<any>;

  // PayPal
  createPaypalOrder(data: { orderId: string; amount: number; currency: string; status?: string }): Promise<any>;
  findPaypalOrder(orderId: string): Promise<any | null>;
  updatePaypalOrder(orderId: string, status: string): Promise<any>;

  // SSLCommerz
  createSslcommerzTx(data: { tranId: string; amount: number; status?: string; valId?: string }): Promise<any>;
  findSslcommerzTx(tranId: string): Promise<any | null>;
  updateSslcommerzTx(tranId: string, data: Record<string, any>): Promise<any>;

  // bKash
  createBkashTx(data: { paymentId: string; amount: number; status?: string }): Promise<any>;
  findBkashTx(paymentId: string): Promise<any | null>;
  updateBkashTx(paymentId: string, data: Record<string, any>): Promise<any>;

  // Offline Bank Slip
  createOfflineBankSlip(data: { bookingId: string; bankName: string; slipNumber: string; slipFileUrl: string; amount: number }): Promise<any>;
  findOfflineBankSlips(bookingId?: string): Promise<any[]>;
  approveOfflineBankSlip(id: string, approvedBy: string): Promise<any>;
}
