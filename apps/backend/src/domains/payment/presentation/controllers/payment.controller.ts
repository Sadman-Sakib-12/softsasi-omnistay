import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { PaymentOrchestratorService } from '../../application/services/payment-orchestrator.service.js';
import {
  InitiatePaymentDto,
  RefundPaymentDto,
  SubmitOfflineSlipDto,
  VerifyPaymentDto,
} from '../dto/payment.dto.js';

@ApiTags('Payment Gateways - Global Payment Orchestration (Strategy Pattern)')
@Controller('api/v1/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentOrchestratorService) {}

  @Get('gateways')
  @ApiOperation({ summary: 'List all supported global and regional payment gateways' })
  getSupportedGateways() {
    return this.paymentService.listSupportedGateways();
  }

  @Post('initiate')
  @ApiOperation({ summary: 'Polymorphic payment initiation dispatching to specified gateway strategy' })
  initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiatePayment(dto.gateway, {
      bookingId: dto.bookingId,
      amount: dto.amount,
      currency: dto.currency || 'USD',
      customerEmail: dto.customerEmail,
      customerName: dto.customerName,
      returnUrl: dto.returnUrl,
    });
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment status and capture order from gateway provider' })
  verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentService.verifyPayment(dto.gateway, dto.transactionId);
  }

  @Post('webhooks/:gateway')
  @ApiOperation({ summary: 'Inbound asynchronous webhook event listener per payment provider' })
  handleWebhook(@Param('gateway') gateway: string, @Body() payload: any) {
    return this.paymentService.handleWebhook(gateway, payload);
  }

  @Post('offline-slip')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload manual bank wire deposit slip for reservation verification' })
  submitOfflineSlip(@Body() dto: SubmitOfflineSlipDto) {
    return this.paymentService.submitOfflineBankSlip(dto);
  }

  @Get('offline-slips')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List submitted offline bank wire slips for admin review' })
  listOfflineSlips(@Query('bookingId') bookingId?: string) {
    return this.paymentService.listOfflineSlips(bookingId);
  }

  @Post('offline-slips/:id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve manual bank wire deposit slip and confirm reservation' })
  approveOfflineSlip(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.paymentService.approveOfflineSlip(id, user.userId);
  }

  @Post('refund')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Execute gateway refund transaction for cancelled bookings' })
  refundPayment(@Body() dto: RefundPaymentDto) {
    return this.paymentService.processRefund(dto.gateway, {
      transactionId: dto.transactionId,
      amount: dto.amount,
      reason: dto.reason,
    });
  }
}
