import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface.js';

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findGatewayConfigs() {
    return this.prisma.paymentGatewayConfig.findMany({
      orderBy: { gatewayCode: 'asc' },
    });
  }

  async findGatewayConfig(gatewayCode: string) {
    return this.prisma.paymentGatewayConfig.findUnique({
      where: { gatewayCode },
    });
  }

  async createOrUpdateGatewayConfig(data: any) {
    return this.prisma.paymentGatewayConfig.upsert({
      where: { gatewayCode: data.gatewayCode },
      create: data,
      update: data,
    });
  }

  async recordWebhook(data: any) {
    return this.prisma.paymentGatewayWebhook.create({ data });
  }

  async createStripePaymentIntent(data: any) {
    return this.prisma.stripePaymentIntent.create({ data });
  }

  async findStripePaymentIntent(intentId: string) {
    return this.prisma.stripePaymentIntent.findUnique({ where: { intentId } });
  }

  async updateStripePaymentIntent(intentId: string, status: string) {
    return this.prisma.stripePaymentIntent.update({
      where: { intentId },
      data: { status },
    });
  }

  async createPaypalOrder(data: any) {
    return this.prisma.paypalOrder.create({ data });
  }

  async findPaypalOrder(orderId: string) {
    return this.prisma.paypalOrder.findUnique({ where: { orderId } });
  }

  async updatePaypalOrder(orderId: string, status: string) {
    return this.prisma.paypalOrder.update({
      where: { orderId },
      data: { status },
    });
  }

  async createSslcommerzTx(data: any) {
    return this.prisma.sslcommerzTransaction.create({ data });
  }

  async findSslcommerzTx(tranId: string) {
    return this.prisma.sslcommerzTransaction.findUnique({ where: { tranId } });
  }

  async updateSslcommerzTx(tranId: string, data: Record<string, any>) {
    return this.prisma.sslcommerzTransaction.update({
      where: { tranId },
      data,
    });
  }

  async createBkashTx(data: any) {
    return this.prisma.bkashTransaction.create({ data });
  }

  async findBkashTx(paymentId: string) {
    return this.prisma.bkashTransaction.findUnique({ where: { paymentId } });
  }

  async updateBkashTx(paymentId: string, data: Record<string, any>) {
    return this.prisma.bkashTransaction.update({
      where: { paymentId },
      data,
    });
  }

  async createOfflineBankSlip(data: any) {
    return this.prisma.offlineBankSlip.create({ data });
  }

  async findOfflineBankSlips(bookingId?: string) {
    return this.prisma.offlineBankSlip.findMany({
      where: bookingId ? { bookingId } : undefined,
      orderBy: { submittedAt: 'desc' },
    });
  }

  async approveOfflineBankSlip(id: string, approvedBy: string) {
    return this.prisma.offlineBankSlip.update({
      where: { id },
      data: { isApproved: true, approvedBy },
    });
  }
}
