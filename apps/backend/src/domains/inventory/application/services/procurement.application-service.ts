import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  INVENTORY_REPOSITORY_TOKEN,
  type IInventoryRepository,
} from '../../domain/repositories/inventory.repository.interface.js';
import { evaluateThreeWayMatch } from '../../domain/rules/inventory.rule.js';
import type {
  CreateGoodsReceivedNoteDto,
  CreatePurchaseOrderDto,
  ThreeWayMatchDto,
} from '../../presentation/dto/procurement.dto.js';
import { WarehouseApplicationService } from './warehouse.application-service.js';

@Injectable()
export class ProcurementApplicationService {
  constructor(
    @Inject(INVENTORY_REPOSITORY_TOKEN)
    private readonly repo: IInventoryRepository,
    private readonly warehouseService: WarehouseApplicationService,
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

    return this.repo.createPurchase({
      tenantId,
      poNumber,
      vendorId: dto.vendorId,
      totalCost,
      status: 'approved',
      products: {
        create: itemsData,
      },
    });
  }

  async getPurchaseOrders(tenantId: string) {
    let list = await this.repo.findPurchases(tenantId);
    if (!list || list.length === 0) {
      await this.seedDefaultPurchases(tenantId);
      list = await this.repo.findPurchases(tenantId);
    }
    return list;
  }

  private async seedDefaultPurchases(tenantId: string) {
    const products = await this.repo.findProducts(tenantId);
    if (!products || products.length === 0) return;

    const towel = products.find((p: any) => p.sku === 'LIN-TOW-001') || products[0];
    const beef = products.find((p: any) => p.sku === 'KIT-MEAT-004') || products[1] || products[0];

    try {
      // 1. PO-2026-091: Linens (Received with GRN)
      const po1 = await this.repo.createPurchase({
        tenantId,
        poNumber: 'PO-2026-091',
        totalCost: 2900.0,
        status: 'received',
        products: {
          create: [
            {
              productId: towel.id,
              quantity: 200,
              unitCost: 14.5,
              totalCost: 2900.0,
            },
          ],
        },
      });

      await this.repo.createGoodsReceivedNote({
        purchaseId: po1.id,
        grnNumber: 'GRN-100291',
        receivedDate: new Date(),
        status: 'accepted',
        items: {
          create: [
            {
              itemTitle: `${towel.name} (200 Units Delivery)`,
              qtyOrdered: 200,
              qtyReceived: 200,
              isDamaged: false,
            },
          ],
        },
      });

      // 2. PO-2026-092: Gourmet Beef (Approved & Transmitted)
      await this.repo.createPurchase({
        tenantId,
        poNumber: 'PO-2026-092',
        totalCost: 2100.0,
        status: 'approved',
        products: {
          create: [
            {
              productId: beef.id,
              quantity: 50,
              unitCost: 42.0,
              totalCost: 2100.0,
            },
          ],
        },
      });
    } catch {
      // Skip if already seeded
    }
  }

  async receiveGoods(dto: CreateGoodsReceivedNoteDto, defaultWarehouseId?: string) {
    const purchase = await this.repo.findPurchaseById(dto.purchaseId);
    if (!purchase) throw new NotFoundException('Purchase order not found');

    const grnNumber = `GRN-${Date.now().toString().slice(-6)}`;

    const grn = await this.repo.createGoodsReceivedNote({
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
    });

    await this.repo.updatePurchase(dto.purchaseId, { status: 'received' });

    if (defaultWarehouseId && purchase.products) {
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
    const po = await this.repo.findPurchaseById(dto.purchaseId);
    const grn = await this.repo.findGoodsReceivedNoteById(dto.grnId);

    if (!po || !grn) {
      throw new NotFoundException('Purchase Order or GRN not found for 3-way matching');
    }

    const grnItemsWithCost = (po.products || []).map((poLine: any, idx: number) => {
      const grnLine = grn.items?.[idx];
      return {
        qtyReceived: grnLine ? Number(grnLine.qtyReceived) : 0,
        unitCost: Number(poLine.unitCost),
        isDamaged: grnLine?.isDamaged || false,
      };
    });

    const matchResult = evaluateThreeWayMatch(
      Number(po.totalCost),
      Number(dto.billedAmount),
      grnItemsWithCost,
      1.0,
    );

    return {
      matchStatus: matchResult.matchStatus,
      poNumber: po.poNumber,
      grnNumber: grn.grnNumber,
      vendorInvoiceNumber: dto.vendorInvoiceNumber || 'N/A',
      poAmount: matchResult.poAmount,
      grnReceivedValue: matchResult.grnReceivedValue,
      billedAmount: matchResult.billedAmount,
      variance: matchResult.variance,
      variancePercent: matchResult.variancePercent,
      recommendation: matchResult.recommendation,
    };
  }
}
