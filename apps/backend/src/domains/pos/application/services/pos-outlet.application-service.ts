import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  POS_REPOSITORY_TOKEN,
  type IPosRepository,
} from '../../domain/repositories/pos.repository.interface.js';
import type {
  CreateDiningTableDto,
  CreatePosOutletDto,
  MergeTablesDto,
  TransferTableDto,
  UpdateTablePositionDto,
} from '../../presentation/dto/pos-outlet.dto.js';

@Injectable()
export class PosOutletApplicationService {
  constructor(
    @Inject(POS_REPOSITORY_TOKEN)
    private readonly repo: IPosRepository,
  ) {}

  async createOutlet(tenantId: string, dto: CreatePosOutletDto) {
    return this.repo.createOutlet({
      tenantId,
      outletName: dto.outletName,
      outletType: dto.outletType,
      isActive: dto.isActive ?? true,
    });
  }

  async getOutlets(tenantId: string) {
    let list = await this.repo.findOutlets(tenantId);
    if (!list || list.length === 0) {
      await this.seedDefaultPosInfrastructure(tenantId);
      list = await this.repo.findOutlets(tenantId);
    }
    return list;
  }

  private async seedDefaultPosInfrastructure(tenantId: string) {
    try {
      // 1. The Grand Pavilion All-Day Dining
      const restaurant = await this.repo.createOutlet({
        tenantId,
        outletName: 'The Grand Pavilion All-Day Dining',
        outletType: 'restaurant',
        isActive: true,
      });

      // Terminal
      await this.repo.createTerminal({
        outletId: restaurant.id,
        terminalName: 'Dining Room Touch Terminal 1',
        deviceSerial: 'POS-REST-02',
        isActive: true,
      });

      // Tables
      const tables = [
        { tableNumber: 'Table T-01', seatingCap: 2, status: 'vacant', posX: 18, posY: 32 },
        { tableNumber: 'Table T-02', seatingCap: 4, status: 'seated', posX: 42, posY: 32 },
        { tableNumber: 'Table T-03', seatingCap: 4, status: 'cooking', posX: 68, posY: 32 },
        { tableNumber: 'Table T-04', seatingCap: 6, status: 'dining', posX: 68, posY: 68 },
        { tableNumber: 'Table T-05', seatingCap: 2, status: 'vacant', posX: 18, posY: 68 },
        { tableNumber: 'Table T-06', seatingCap: 4, status: 'check_printed', posX: 42, posY: 68 },
        { tableNumber: 'VIP Booth A', seatingCap: 8, status: 'dining', posX: 88, posY: 50 },
        { tableNumber: 'Outdoor Garden G-01', seatingCap: 4, status: 'vacant', posX: 18, posY: 90 },
        { tableNumber: 'Pool Cabana C-01', seatingCap: 6, status: 'seated', posX: 50, posY: 90 },
      ];
      for (const t of tables) {
        await this.repo.createTable({
          outletId: restaurant.id,
          tableNumber: t.tableNumber,
          seatingCap: t.seatingCap,
          status: t.status,
          posX: t.posX,
          posY: t.posY,
        });
      }

      // KDS Stations
      const grillStation = await this.repo.createKdsStation({
        outletId: restaurant.id,
        stationName: 'Grill & Broiler Station',
        stationType: 'grill',
      });
      const pizzaStation = await this.repo.createKdsStation({
        outletId: restaurant.id,
        stationName: 'Woodfired Pizza Station',
        stationType: 'oven',
      });
      await this.repo.createKdsStation({
        outletId: restaurant.id,
        stationName: 'Pantry & Salad Station',
        stationType: 'cold_pantry',
      });
      await this.repo.createKdsStation({
        outletId: restaurant.id,
        stationName: 'Beverage & Cocktail Bar',
        stationType: 'bar',
      });

      // Menu
      const menu = await this.repo.createMenu({
        outletId: restaurant.id,
        menuName: 'Grand Pavilion À La Carte',
        isActive: true,
      });

      // Categories & Items
      const catStarters = await this.repo.createCategory({
        menuId: menu.id,
        categoryName: 'Starters & Appetizers',
        displayOrder: 1,
      });
      await this.repo.createMenuItem({
        categoryId: catStarters.id,
        itemName: 'Burrata di Puglia Salad',
        price: 21.0,
        allergens: ['DAIRY', 'NUTS'],
        isAvailable: true,
      });
      await this.repo.createMenuItem({
        categoryId: catStarters.id,
        itemName: 'Crispy Calamari Fritti',
        price: 18.5,
        allergens: ['SEAFOOD', 'GLUTEN'],
        isAvailable: true,
      });

      const catMains = await this.repo.createCategory({
        menuId: menu.id,
        categoryName: 'Mains & Steaks',
        displayOrder: 2,
      });
      await this.repo.createMenuItem({
        categoryId: catMains.id,
        itemName: 'Black Truffle Risotto',
        price: 34.0,
        allergens: ['DAIRY', 'MUSHROOMS'],
        isAvailable: true,
      });
      await this.repo.createMenuItem({
        categoryId: catMains.id,
        itemName: 'Prime Wagyu Ribeye Steak (300g)',
        price: 68.0,
        allergens: [],
        isAvailable: true,
      });

      const catPizza = await this.repo.createCategory({
        menuId: menu.id,
        categoryName: 'Woodfired Pizza',
        displayOrder: 3,
      });
      await this.repo.createMenuItem({
        categoryId: catPizza.id,
        itemName: 'Tartufo & Porcini Pizza',
        price: 28.0,
        allergens: ['GLUTEN', 'DAIRY'],
        isAvailable: true,
      });
      await this.repo.createMenuItem({
        categoryId: catPizza.id,
        itemName: 'Margherita di Bufala',
        price: 22.0,
        allergens: ['GLUTEN', 'DAIRY'],
        isAvailable: true,
      });

      const catDesserts = await this.repo.createCategory({
        menuId: menu.id,
        categoryName: 'Desserts',
        displayOrder: 4,
      });
      await this.repo.createMenuItem({
        categoryId: catDesserts.id,
        itemName: 'Valrhona Chocolate Fondant',
        price: 16.0,
        allergens: ['DAIRY', 'EGGS'],
        isAvailable: true,
      });
      await this.repo.createMenuItem({
        categoryId: catDesserts.id,
        itemName: 'Madagascar Vanilla Gelato',
        price: 12.0,
        allergens: ['DAIRY'],
        isAvailable: true,
      });

      const catCocktails = await this.repo.createCategory({
        menuId: menu.id,
        categoryName: 'Artisan Cocktails & Wine',
        displayOrder: 5,
      });
      await this.repo.createMenuItem({
        categoryId: catCocktails.id,
        itemName: 'Smoked Bourbon Old Fashioned',
        price: 19.0,
        allergens: [],
        isAvailable: true,
      });
      await this.repo.createMenuItem({
        categoryId: catCocktails.id,
        itemName: 'Château Margaux 2018',
        price: 145.0,
        allergens: [],
        isAvailable: true,
      });

      // 2. Skyline Rooftop & Poolside Bar
      const bar = await this.repo.createOutlet({
        tenantId,
        outletName: 'Skyline Rooftop & Poolside Bar',
        outletType: 'bar',
        isActive: true,
      });
      await this.repo.createTerminal({
        outletId: bar.id,
        terminalName: 'Rooftop Bar Speed Terminal',
        deviceSerial: 'POS-BAR-01',
        isActive: true,
      });
      await this.repo.createTable({ outletId: bar.id, tableNumber: 'Bar Stool 1', seatingCap: 1, status: 'seated', posX: 15, posY: 20 });
      await this.repo.createTable({ outletId: bar.id, tableNumber: 'Bar Stool 2', seatingCap: 1, status: 'vacant', posX: 25, posY: 20 });
      await this.repo.createTable({ outletId: bar.id, tableNumber: 'High-Top H-01', seatingCap: 4, status: 'dining', posX: 50, posY: 40 });
      await this.repo.createTable({ outletId: bar.id, tableNumber: 'Sunset Cabana 1', seatingCap: 6, status: 'seated', posX: 80, posY: 60 });

      // 3. Serenity Wellness & Ayurvedic Spa
      const spa = await this.repo.createOutlet({
        tenantId,
        outletName: 'Serenity Wellness & Ayurvedic Spa',
        outletType: 'spa',
        isActive: true,
      });
      await this.repo.createTerminal({
        outletId: spa.id,
        terminalName: 'Spa Reception Terminal',
        deviceSerial: 'POS-SPA-03',
        isActive: true,
      });
      await this.repo.createTable({ outletId: spa.id, tableNumber: 'Treatment Suite S-01', seatingCap: 1, status: 'dining', posX: 25, posY: 40 });
      await this.repo.createTable({ outletId: spa.id, tableNumber: 'Treatment Suite S-02', seatingCap: 1, status: 'vacant', posX: 50, posY: 40 });
      await this.repo.createTable({ outletId: spa.id, tableNumber: 'Hammam & Hydro Suite', seatingCap: 2, status: 'vacant', posX: 75, posY: 40 });

      // 4. Resort Souvenir & Luxury Gift Shop
      const giftShop = await this.repo.createOutlet({
        tenantId,
        outletName: 'Resort Souvenir & Luxury Gift Shop',
        outletType: 'retail',
        isActive: true,
      });
      await this.repo.createTerminal({
        outletId: giftShop.id,
        terminalName: 'Gift Shop Cash Wrap',
        deviceSerial: 'POS-GIFT-04',
        isActive: true,
      });
      await this.repo.createTable({ outletId: giftShop.id, tableNumber: 'Checkout Counter 1', seatingCap: 1, status: 'vacant', posX: 50, posY: 50 });

      // Auto-create initial active KDS orders for the restaurant
      const sampleOrder1 = await this.repo.createOrder({
        outletId: restaurant.id,
        orderNumber: 'POS-KDS-8841',
        guestCount: 4,
        subtotal: 89.0,
        serviceCharge: 8.9,
        taxAmount: 4.45,
        totalAmount: 102.35,
        status: 'open',
        serverName: 'Maria S.',
        items: {
          create: [
            { itemName: 'Prime Wagyu Ribeye Steak (300g)', quantity: 1, unitPrice: 68.0, totalPrice: 68.0, notes: 'Medium Rare, No Butter' },
            { itemName: 'Burrata di Puglia Salad', quantity: 1, unitPrice: 21.0, totalPrice: 21.0, notes: 'Extra Virgin Olive Oil' },
          ],
        },
      });

      // Sent 18 minutes ago to trigger the pulsating red delay alert (>15 mins)
      const eighteenMinsAgo = new Date(Date.now() - 18 * 60 * 1000);
      await this.repo.createKitchenOrder({
        orderId: sampleOrder1.id,
        stationId: grillStation.id,
        ticketNumber: 'KDS-8841',
        status: 'cooking',
        sentAt: eighteenMinsAgo,
      });

      const sampleOrder2 = await this.repo.createOrder({
        outletId: restaurant.id,
        orderNumber: 'POS-KDS-8842',
        guestCount: 2,
        subtotal: 50.0,
        serviceCharge: 5.0,
        taxAmount: 2.5,
        totalAmount: 57.5,
        status: 'open',
        serverName: 'Alex K.',
        items: {
          create: [
            { itemName: 'Tartufo & Porcini Pizza', quantity: 1, unitPrice: 28.0, totalPrice: 28.0, notes: 'Extra Crispy Crust' },
            { itemName: 'Margherita di Bufala', quantity: 1, unitPrice: 22.0, totalPrice: 22.0, notes: 'Fresh Basil' },
          ],
        },
      });

      // Sent 7 minutes ago
      const sevenMinsAgo = new Date(Date.now() - 7 * 60 * 1000);
      await this.repo.createKitchenOrder({
        orderId: sampleOrder2.id,
        stationId: pizzaStation.id,
        ticketNumber: 'KDS-8842',
        status: 'cooking',
        sentAt: sevenMinsAgo,
      });
    } catch {
      // Skip on race condition
    }
  }

  async getOutletById(tenantId: string, outletId: string) {
    const outlet = await this.repo.findOutletById(tenantId, outletId);
    if (!outlet) throw new NotFoundException(`Outlet with ID ${outletId} not found`);
    return outlet;
  }

  async createTable(tenantId: string, outletId: string, dto: CreateDiningTableDto) {
    await this.getOutletById(tenantId, outletId);
    return this.repo.createTable({
      outletId,
      tableNumber: dto.tableNumber,
      seatingCap: dto.seatingCap,
      status: dto.status || 'vacant',
      posX: dto.posX || 0,
      posY: dto.posY || 0,
    });
  }

  async updateTablePosition(tableId: string, dto: UpdateTablePositionDto) {
    return this.repo.updateTable(tableId, {
      posX: dto.posX,
      posY: dto.posY,
    });
  }

  async updateTableStatus(tableId: string, status: string) {
    return this.repo.updateTable(tableId, { status });
  }

  async transferTable(dto: TransferTableDto) {
    const sourceTable = await this.repo.findTableById(dto.sourceTableId);
    const targetTable = await this.repo.findTableById(dto.targetTableId);

    if (!sourceTable || !targetTable) {
      throw new NotFoundException('Source or target table not found');
    }

    if (targetTable.status !== 'vacant') {
      throw new BadRequestException(`Target table ${targetTable.tableNumber} is not vacant`);
    }

    // Move active open orders to target table
    await this.repo.updateManyOrders(
      { tableId: sourceTable.id, status: 'open' },
      { tableId: targetTable.id },
    );

    // Update statuses
    await this.repo.updateTable(sourceTable.id, { status: 'vacant' });
    await this.repo.updateTable(targetTable.id, { status: 'seated' });

    return {
      message: `Successfully transferred party from Table ${sourceTable.tableNumber} to Table ${targetTable.tableNumber}`,
      sourceTableId: sourceTable.id,
      targetTableId: targetTable.id,
      reason: dto.reason || 'Guest requested move',
    };
  }

  async mergeTables(dto: MergeTablesDto) {
    const primary = await this.repo.findTableById(dto.primaryTableId);
    if (!primary) throw new NotFoundException('Primary table not found');

    for (const secId of dto.mergedTableIds) {
      await this.repo.updateManyOrders(
        { tableId: secId, status: 'open' },
        { tableId: primary.id },
      );
      await this.repo.updateTable(secId, { status: 'dining' });
    }

    await this.repo.updateTable(primary.id, { status: 'dining' });

    return {
      message: `Tables merged successfully into primary table ${primary.tableNumber}`,
      primaryTableId: primary.id,
      mergedTableIds: dto.mergedTableIds,
    };
  }
}
