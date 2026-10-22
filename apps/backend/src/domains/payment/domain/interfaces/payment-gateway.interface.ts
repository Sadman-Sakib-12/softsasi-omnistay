export interface PaymentInitiateRequest {
  bookingId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitiateResponse {
  gateway: string;
  transactionId: string;
  status: 'pending' | 'requires_action' | 'paid' | 'failed';
  redirectUrl?: string;
  clientSecret?: string;
  amount: number;
  currency: string;
}

export interface PaymentVerifyResponse {
  gateway: string;
  transactionId: string;
  isVerified: boolean;
  amount: number;
  currency: string;
  status: 'paid' | 'failed' | 'pending';
  rawResponse?: any;
}

export interface PaymentRefundRequest {
  transactionId: string;
  amount?: number;
  reason?: string;
}

export interface PaymentRefundResponse {
  gateway: string;
  refundId: string;
  status: 'succeeded' | 'pending' | 'failed';
  amountRefunded: number;
}

export interface IPaymentGatewayStrategy {
  readonly gatewayCode: string;
  initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse>;
  verifyPayment(transactionId: string): Promise<PaymentVerifyResponse>;
  handleWebhookCallback(payload: any): Promise<{ isProcessed: boolean; eventType: string }>;
  processRefund(req: PaymentRefundRequest): Promise<PaymentRefundResponse>;
}
