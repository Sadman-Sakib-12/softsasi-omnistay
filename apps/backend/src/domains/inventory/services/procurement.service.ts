import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateGoodsReceivedNoteDto, CreatePurchaseOrderDto, ThreeWayMatchDto } from '../dto/procurement.dto.js';
import { WarehouseService } from './warehouse.service.js';

@Injectable()
export class ProcurementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly warehouseService: WarehouseService,
  ) {}

  async createPurchaseOrder(tenantId: string, dto: CreatePurchaseOrderDto) {
    const poNumber = `PO-${Date.now().toString().slice(-6)}`;

    let totalCost = 0;
    const itemsData = dto.items.map((item) => {
      const lineCost = Number(item.quantity) * Number(item.unitCost);
      totalCost += lineCost;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: lineCost,
      };
    });

    return this.prisma.purchase.create({
      data: {
        tenantId,
        poNumber,
        vendorId: dto.vendorId,
        totalCost,
        status: 'approved',
        products: {
          create: itemsData,
        },
      },
      include: {
        products: {
          include: { product: true },
        },
      },
    });
  }

  async getPurchaseOrders(tenantId: string) {
    return this.prisma.purchase.findMany({
      where: { tenantId },
      include: {
        products: { include: { product: true } },
        grns: { include: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async receiveGoods(dto: CreateGoodsReceivedNoteDto, defaultWarehouseId?: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: dto.purchaseId },
      include: { products: true },
    });
    if (!purchase) throw new NotFoundException('Purchase order not found');

    const grnNumber = `GRN-${Date.now().toString().slice(-6)}`;

    const grn = await this.prisma.goodsReceivedNote.create({
      data: {
        purchaseId: dto.purchaseId,
        grnNumber,
        receivedDate: new Date(),
        status: 'accepted',
        items: {
          create: dto.items.map((item) => ({
            itemTitle: item.itemTitle,
            qtyOrdered: item.qtyOrdered,
            qtyReceived: item.qtyReceived,
            isDamaged: item.isDamaged || false,
          })),
        },
      },
      include: { items: true },
    });

    // Update Purchase status
    await this.prisma.purchase.update({
      where: { id: dto.purchaseId },
      data: { status: 'received' },
    });

    // If warehouse provided, auto-increment inventory stock for undamaged received items
    if (defaultWarehouseId) {
      for (let i = 0; i < purchase.products.length; i++) {
        const poProd = purchase.products[i];
        const inspected = dto.items[i];
        if (inspected && !inspected.isDamaged && Number(inspected.qtyReceived) > 0) {
          await this.warehouseService.updateStock(
            defaultWarehouseId,
            poProd.productId,
            Number(inspected.qtyReceived),
            'purchase_received',
            `PO: ${purchase.poNumber}, GRN: ${grnNumber}`,
          );
        }
      }
    }

    return grn;
  }

  async executeThreeWayMatch(dto: ThreeWayMatchDto) {
    const po = await this.prisma.purchase.findUnique({
      where: { id: dto.purchaseId },
      include: { products: true },
    });
    const grn = await this.prisma.goodsReceivedNote.findUnique({
      where: { id: dto.grnId },
      include: { items: true },
    });

    if (!po || !grn) {
      throw new NotFoundException('Purchase Order or GRN not found for 3-way matching');
    }

    const poAmount = Number(po.totalCost);
    const billedAmount = Number(dto.billedAmount);

    // Calculate GRN accepted value
    let grnValue = 0;
    for (let i = 0; i < po.products.length; i++) {
      const poLine = po.products[i];
      const grnLine = grn.items[i];
      if (grnLine && !grnLine.isDamaged) {
        grnValue += Number(grnLine.qtyReceived) * Number(poLine.unitCost);
      }
    }

    const variance = Math.abs(billedAmount - grnValue);
    const variancePercent = grnValue > 0 ? (variance / grnValue) * 100 : 0;
    const isMatched = variancePercent <= 1.0; // Within 1% tolerance

    return {
      matchStatus: isMatched ? 'MATCHED' : 'DISCREPANCY_FLAGGED',
      poNumber: po.poNumber,
      grnNumber: grn.grnNumber,
      vendorInvoiceNumber: dto.vendorInvoiceNumber || 'N/A',
      poAmount,
      grnReceivedValue: Number(grnValue.toFixed(2)),
      billedAmount,
      variance: Number(variance.toFixed(2)),
      variancePercent: Number(variancePercent.toFixed(2)),
      recommendation: isMatched
        ? 'Approve vendor payment release'
        : 'Hold payment and issue Debit Note for discrepancy / damaged items',
    };
  }
}
