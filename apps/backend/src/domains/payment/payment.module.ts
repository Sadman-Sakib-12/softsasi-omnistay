import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Repo
import { PAYMENT_REPOSITORY_TOKEN } from './domain/repositories/payment.repository.interface.js';
import { PrismaPaymentRepository } from './infrastructure/repositories/prisma-payment.repository.js';

// Adapters
import { StripeGatewayAdapter } from './infrastructure/adapters/stripe-gateway.adapter.js';
import { PaypalGatewayAdapter } from './infrastructure/adapters/paypal-gateway.adapter.js';
import { SslcommerzGatewayAdapter } from './infrastructure/adapters/sslcommerz-gateway.adapter.js';
import { BkashGatewayAdapter } from './infrastructure/adapters/bkash-gateway.adapter.js';
import { RazorpayGatewayAdapter } from './infrastructure/adapters/razorpay-gateway.adapter.js';

// Orchestrator
import { PaymentOrchestratorService } from './application/services/payment-orchestrator.service.js';

// Controller
import { PaymentController } from './presentation/controllers/payment.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentController],
  providers: [
    { provide: PAYMENT_REPOSITORY_TOKEN, useClass: PrismaPaymentRepository },
    StripeGatewayAdapter,
    PaypalGatewayAdapter,
    SslcommerzGatewayAdapter,
    BkashGatewayAdapter,
    RazorpayGatewayAdapter,
    PaymentOrchestratorService,
  ],
  exports: [PaymentOrchestratorService],
})
export class PaymentModule {}
