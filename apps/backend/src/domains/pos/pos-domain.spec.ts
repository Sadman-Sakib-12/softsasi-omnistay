import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateOrderTotals, calculateShiftVariance } from './domain/rules/pos.rule.js';
import { PosOutletApplicationService } from './application/services/pos-outlet.application-service.js';
import { PosMenuApplicationService } from './application/services/pos-menu.application-service.js';
import { PosOrderApplicationService } from './application/services/pos-order.application-service.js';
import { KdsApplicationService } from './application/services/kds.application-service.js';
import { PosRoomChargeApplicationService } from './application/services/pos-room-charge.application-service.js';
import { PosShiftApplicationService } from './application/services/pos-shift.application-service.js';
import type { IPosRepository } from './domain/repositories/pos.repository.interface.js';

describe('POS Domain — Clean Architecture & DDD Test Suite', () => {
  describe('Domain Rules (Pure Business Logic)', () => {
    it('calculateOrderTotals: should calculate subtotal, tax, service charge, and total', () => {
      const items = [
        { quantity: 2, unitPrice: 50.0 }, // 100
        { quantity: 1, unitPrice: 20.0 }, // 20 -> subtotal = 120
      ];
      const result = calculateOrderTotals(items, 10, 5);
      expect(result.subtotal).toBe(120);
      expect(result.taxAmount).toBe(12);
      expect(result.serviceCharge).toBe(6);
      expect(result.totalAmount).toBe(138);
    });

    it('calculateShiftVariance: should detect balanced, overage, and shortage', () => {
      expect(calculateShiftVariance(500, 500)).toEqual({ variance: 0, status: 'balanced' });
      expect(calculateShiftVariance(550, 500)).toEqual({ variance: 50, status: 'overage' });
      expect(calculateShiftVariance(475, 500)).toEqual({ variance: -25, status: 'shortage' });
    });
  });

  describe('Application Services & Repository Orchestration', () => {
    let mockRepo: IPosRepository;
    let outletService: PosOutletApplicationService;
    let menuService: PosMenuApplicationService;
    let orderService: PosOrderApplicationService;
    let kdsService: KdsApplicationService;
    let roomChargeService: PosRoomChargeApplicationService;
    let shiftService: PosShiftApplicationService;

    beforeEach(() => {
      mockRepo = {
        createOutlet: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'out-1', ...data })),
        findOutlets: vi.fn().mockResolvedValue([{ id: 'out-1', outletName: 'Beachside Grill' }]),
        findOutletById: vi.fn().mockImplementation((tenantId, id) => {
          if (id === 'out-1') return Promise.resolve({ id: 'out-1', outletName: 'Beachside Grill', tenantId });
          return Promise.resolve(null);
        }),
        createTable: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'tbl-1', ...data })),
        findTableById: vi.fn().mockImplementation((id) => {
          if (id === 'tbl-1') return Promise.resolve({ id: 'tbl-1', tableNumber: 'T-1', status: 'seated' });
          if (id === 'tbl-2') return Promise.resolve({ id: 'tbl-2', tableNumber: 'T-2', status: 'vacant' });
          return Promise.resolve(null);
        }),
        updateTable: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        updateManyOrders: vi.fn().mockResolvedValue({ count: 1 }),

        createMenu: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'menu-1', ...data })),
        findMenusByOutlet: vi.fn().mockResolvedValue([]),
        createCategory: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'cat-1', ...data })),
        createMenuItem: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'itm-1', ...data })),
        findMenuItemById: vi.fn().mockResolvedValue({ id: 'itm-1', itemName: 'Burger', isAvailable: true }),
        updateMenuItem: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),

        createOrder: vi.fn().mockImplementation((data) => Promise.resolve({
          id: 'ord-101',
          orderNumber: data.orderNumber || 'POS-123456-789',
          totalAmount: data.totalAmount,
          subtotal: data.subtotal,
          serviceCharge: data.serviceCharge,
          taxAmount: data.taxAmount,
          status: 'open',
          items: data.items?.create || [],
        })),
        findOrderById: vi.fn().mockResolvedValue({
          id: 'ord-101',
          orderNumber: 'POS-123456-789',
          totalAmount: 115.0,
          status: 'open',
          tableId: 'tbl-1',
          items: [{ itemName: 'Ribeye Steak', quantity: 2, unitPrice: 50.0 }],
          payments: [],
        }),
        updateOrder: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        createPayment: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'pay-1', ...data })),
        findPaymentsByOrderId: vi.fn().mockResolvedValue([{ id: 'pay-1', amount: 115.0 }]),

        createKdsStation: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'kds-grill', ...data })),
        findDefaultKdsStation: vi.fn().mockResolvedValue({ id: 'kds-grill', stationName: 'Grill' }),
        createKitchenOrder: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'ko-1', ...data })),
        findKdsStationsByOutlet: vi.fn().mockResolvedValue([]),
        findActiveKitchenOrders: vi.fn().mockResolvedValue([
          {
            id: 'ko-1',
            ticketNumber: 'KDS-001',
            status: 'queued',
            sentAt: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago
          },
        ]),
        findKitchenOrderById: vi.fn().mockResolvedValue({ id: 'ko-1', status: 'queued', order: { tableId: 'tbl-1' } }),
        updateKitchenOrder: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),

        findRoomByNumber: vi.fn().mockResolvedValue({ id: 'rm-101', roomNumber: '101' }),
        findActiveBooking: vi.fn().mockResolvedValue({
          id: 'bk-1',
          bookingCode: 'BKG-101',
          guest: { name: 'Alice Smith', email: 'alice@example.com' },
          folios: [{ id: 'fol-1', folioNumber: 'FOL-001', balanceDue: 0, totalCharges: 0 }],
        }),
        createFolio: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'fol-1', ...data })),
        createFolioTransaction: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'tx-1', ...data })),
        updateFolio: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        createRoomChargeLog: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'rcl-1', ...data })),

        findActiveShiftByTerminal: vi.fn().mockResolvedValue(null),
        findShiftById: vi.fn().mockResolvedValue({
          id: 'sh-1',
          terminalId: 'term-1',
          cashierName: 'John Doe',
          startedAt: new Date(Date.now() - 4 * 3600 * 1000),
          openingFloat: 500.0,
          cashDrops: [{ amount: 100.0 }],
        }),
        createShift: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'sh-1', ...data })),
        createCashDrop: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'cd-1', ...data })),
        findPaymentsForShift: vi.fn().mockResolvedValue([
          { paymentMode: 'cash', amount: 300.0 },
          { paymentMode: 'card', amount: 450.0 },
          { paymentMode: 'room_charge', amount: 150.0 },
        ]),
        createXReport: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'xr-1', generatedAt: new Date(), ...data })),
        createZReport: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'zr-1', closedAt: new Date(), ...data })),
        updateShift: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
      };

      outletService = new PosOutletApplicationService(mockRepo);
      menuService = new PosMenuApplicationService(mockRepo);
      orderService = new PosOrderApplicationService(mockRepo);
      kdsService = new KdsApplicationService(mockRepo);
      roomChargeService = new PosRoomChargeApplicationService(mockRepo);
      shiftService = new PosShiftApplicationService(mockRepo);
    });

    it('outletService: should create outlet and floor plan table', async () => {
      const outlet = await outletService.createOutlet('tenant-1', {
        outletName: 'Seaside Bistro',
        outletType: 'restaurant',
      });
      expect(outlet.id).toBe('out-1');
      expect(mockRepo.createOutlet).toHaveBeenCalled();

      const table = await outletService.createTable('tenant-1', 'out-1', {
        tableNumber: 'T-10',
        seatingCap: 4,
      });
      expect(table.id).toBe('tbl-1');
    });

    it('outletService: should transfer table party and merge tables', async () => {
      const transfer = await outletService.transferTable({
        sourceTableId: 'tbl-1',
        targetTableId: 'tbl-2',
      });
      expect(transfer.message).toContain('Successfully transferred');
      expect(mockRepo.updateManyOrders).toHaveBeenCalled();
      expect(mockRepo.updateTable).toHaveBeenCalledWith('tbl-1', { status: 'vacant' });
      expect(mockRepo.updateTable).toHaveBeenCalledWith('tbl-2', { status: 'seated' });

      const merge = await outletService.mergeTables({
        primaryTableId: 'tbl-1',
        mergedTableIds: ['tbl-2'],
      });
      expect(merge.message).toContain('Tables merged successfully');
    });

    it('menuService: should manage menus, categories, and item availability', async () => {
      const menu = await menuService.createMenu('out-1', 'Dinner Menu');
      expect(menu.id).toBe('menu-1');

      const cat = await menuService.createCategory('menu-1', 'Appetizers');
      expect(cat.id).toBe('cat-1');

      const item = await menuService.createMenuItem('cat-1', {
        itemName: 'Bruschetta',
        price: 14.0,
      });
      expect(item.id).toBe('itm-1');

      const toggled = await menuService.toggleItemAvailability('itm-1', false);
      expect(toggled.isAvailable).toBe(false);
    });

    it('orderService: should ring up order with totals, taxes, and service charges', async () => {
      const order = await orderService.createOrder('tenant-1', {
        outletId: 'out-1',
        tableId: 'tbl-1',
        items: [
          {
            itemName: 'Ribeye Steak',
            quantity: 2,
            unitPrice: 50.0,
            modifiers: [{ name: 'Extra Butter', price: 2.5 }],
          },
        ],
      });
      expect(order.id).toBe('ord-101');
      expect(order.subtotal).toBe(105); // (50 + 2.5) * 2 = 105
      expect(mockRepo.createKitchenOrder).toHaveBeenCalled();
    });

    it('orderService: should settle order and split check', async () => {
      const settlement = await orderService.settleOrder('ord-101', {
        paymentMode: 'card',
        amount: 115.0,
      });
      expect(settlement.isSettled).toBe(true);
      expect(settlement.balanceRemaining).toBe(0);

      const split = await orderService.splitCheck('ord-101', { splitCount: 2 });
      expect(split.splitCount).toBe(2);
      expect(split.splits).toHaveLength(2);
      expect(split.splits[0].amount).toBe(57.5);
    });

    it('kdsService: should track kitchen queue and raise delay alert if > 15 minutes', async () => {
      const queue = await kdsService.getActiveKitchenQueue('out-1');
      expect(queue).toHaveLength(1);
      expect(queue[0].isDelayedAlert).toBe(true);
      expect(queue[0].waitTimeMinutes).toBeGreaterThanOrEqual(15);

      const updated = await kdsService.updateKitchenOrderStatus('ko-1', { status: 'served' });
      expect(updated.status).toBe('served');
      expect(mockRepo.updateTable).toHaveBeenCalledWith('tbl-1', { status: 'dining' });
    });

    it('roomChargeService: should verify occupancy and post charge to guest folio', async () => {
      const verification = await roomChargeService.verifyRoomForCharge('prop-1', '101');
      expect(verification.isOccupied).toBe(true);
      expect(verification.guestName).toBe('Alice Smith');

      const charge = await roomChargeService.chargeToRoom({
        orderId: 'ord-101',
        roomNumber: '101',
        guestName: 'Alice Smith',
        amount: 115.0,
      });
      expect(charge.success).toBe(true);
      expect(charge.orderStatus).toBe('completed');
      expect(mockRepo.createFolioTransaction).toHaveBeenCalled();
    });

    it('shiftService: should manage cashier shift, cash drops, X-Report and Z-Report', async () => {
      const shift = await shiftService.openShift({
        terminalId: 'term-1',
        cashierName: 'John Doe',
        openingFloat: 500.0,
      });
      expect(shift.id).toBe('sh-1');

      const drop = await shiftService.recordCashDrop('sh-1', { amount: 100 });
      expect(drop.id).toBe('cd-1');

      const xReport = await shiftService.generateXReport('sh-1');
      expect(xReport.reportType).toContain('X-Report');
      expect(xReport.expectedDrawerCash).toBe(700); // 500 float + 300 cash - 100 drop = 700

      const zReport = await shiftService.closeShiftAndGenerateZReport('sh-1', {
        physicalCashCounted: 700.0,
      });
      expect(zReport.discrepancy).toBe(0);
      expect(zReport.discrepancyStatus).toBe('BALANCED');
    });
  });
});
