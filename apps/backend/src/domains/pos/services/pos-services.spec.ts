import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PosOutletService } from './pos-outlet.service.js';
import { PosMenuService } from './pos-menu.service.js';
import { PosOrderService } from './pos-order.service.js';
import { KdsService } from './kds.service.js';
import { PosRoomChargeService } from './pos-room-charge.service.js';
import { PosShiftService } from './pos-shift.service.js';

describe('Phase 5 — Touchscreen POS & F&B Operations Suite', () => {
  let mockPrisma: any;
  let outletService: PosOutletService;
  let menuService: PosMenuService;
  let orderService: PosOrderService;
  let kdsService: KdsService;
  let roomChargeService: PosRoomChargeService;
  let shiftService: PosShiftService;

  beforeEach(() => {
    mockPrisma = {
      posOutlet: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'out-1', ...data })),
        findMany: vi.fn().mockResolvedValue([{ id: 'out-1', outletName: 'Beachside Grill' }]),
        findFirst: vi.fn().mockResolvedValue({ id: 'out-1', outletName: 'Beachside Grill', tenantId: 't-1' }),
      },
      diningTable: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'tbl-1', ...data })),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === 'tbl-1') return Promise.resolve({ id: 'tbl-1', tableNumber: 'T-1', status: 'seated' });
          if (where.id === 'tbl-2') return Promise.resolve({ id: 'tbl-2', tableNumber: 'T-2', status: 'vacant' });
          return Promise.resolve(null);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data })),
      },
      posOrder: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({
          id: 'ord-101',
          orderNumber: 'POS-123456-789',
          totalAmount: data.totalAmount,
          subtotal: data.subtotal,
          serviceCharge: data.serviceCharge,
          taxAmount: data.taxAmount,
          status: 'open',
          items: data.items?.create || [],
        })),
        findUnique: vi.fn().mockResolvedValue({
          id: 'ord-101',
          orderNumber: 'POS-123456-789',
          totalAmount: 115.0,
          status: 'open',
          tableId: 'tbl-1',
          items: [{ itemName: 'Ribeye Steak', quantity: 2, unitPrice: 50.0 }],
          payments: [],
        }),
        update: vi.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data })),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      posMenu: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'menu-1', ...data })),
        findMany: vi.fn().mockResolvedValue([]),
      },
      posMenuCategory: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'cat-1', ...data })),
      },
      posMenuItem: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'itm-1', ...data })),
        findUnique: vi.fn().mockResolvedValue({ id: 'itm-1', itemName: 'Burger', isAvailable: true }),
        update: vi.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data })),
      },
      kdsStation: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'kds-grill', ...data })),
        findFirst: vi.fn().mockResolvedValue({ id: 'kds-grill', stationType: 'grill' }),
        findMany: vi.fn().mockResolvedValue([{ id: 'kds-grill', stationName: 'Grill', orders: [] }]),
      },
      posKitchenOrder: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'tkt-1', ...data })),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'tkt-1',
            ticketNumber: 'KDS-0001',
            status: 'queued',
            sentAt: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago (delayed > 15m)
            order: { items: [], table: { tableNumber: 'T-1' } },
          },
        ]),
        findUnique: vi.fn().mockResolvedValue({
          id: 'tkt-1',
          order: { tableId: 'tbl-1' },
          status: 'cooking',
        }),
        update: vi.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data })),
      },
      room: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'room-402',
          roomNumber: '402',
          roomType: { propertyId: 'prop-1' },
        }),
      },
      booking: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'bk-999',
          bookingCode: 'BK-LUX-2026',
          bookingStatus: 'checked_in',
          guest: { name: 'David Miller', email: 'david@luxury.com' },
          folios: [{ id: 'fol-101', folioNumber: 'FOL-001', totalCharges: 500, balanceDue: 500, status: 'open' }],
        }),
      },
      guestFolio: {
        update: vi.fn().mockResolvedValue({ id: 'fol-101', totalCharges: 615, balanceDue: 615 }),
      },
      folioTransaction: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'ftxn-1', ...data })),
      },
      posRoomChargeLog: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'rcl-1', ...data })),
      },
      posPayment: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'pay-1', ...data })),
        findMany: vi.fn().mockResolvedValue([{ amount: 115.0, paymentMode: 'card' }]),
      },
      posCashierShift: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'shift-1', ...data })),
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue({
          id: 'shift-1',
          terminalId: 'term-1',
          cashierName: 'Emily Watson',
          openingFloat: 500.0,
          startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          endedAt: null,
          cashDrops: [{ amount: 200.0 }],
        }),
        update: vi.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data })),
      },
      posCashDrop: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'drop-1', ...data })),
      },
      posXReport: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'x-rep-1', generatedAt: new Date(), ...data })),
      },
      posZReport: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'z-rep-1', closedAt: new Date(), ...data })),
      },
    };

    outletService = new PosOutletService(mockPrisma);
    menuService = new PosMenuService(mockPrisma);
    orderService = new PosOrderService(mockPrisma);
    kdsService = new KdsService(mockPrisma);
    roomChargeService = new PosRoomChargeService(mockPrisma);
    shiftService = new PosShiftService(mockPrisma);
  });

  describe('POS Outlets & Table Management', () => {
    it('should create an outlet and add dining tables with canvas coordinates', async () => {
      const outlet = await outletService.createOutlet('t-1', {
        outletName: 'Ocean Breeze Restaurant',
        outletType: 'restaurant',
      });
      expect(outlet.outletName).toBe('Ocean Breeze Restaurant');

      const table = await outletService.createTable('t-1', outlet.id, {
        tableNumber: 'T-10',
        seatingCap: 6,
        posX: 150,
        posY: 220,
      });
      expect(table.tableNumber).toBe('T-10');
      expect(table.posX).toBe(150);
      expect(table.seatingCap).toBe(6);
    });

    it('should transfer an active table party to a vacant destination table', async () => {
      const res = await outletService.transferTable({
        sourceTableId: 'tbl-1',
        targetTableId: 'tbl-2',
        reason: 'Guest requested sea-view table',
      });
      expect(res.message).toContain('Successfully transferred party from Table T-1 to Table T-2');
      expect(mockPrisma.diningTable.update).toHaveBeenCalledWith({
        where: { id: 'tbl-1' },
        data: { status: 'vacant' },
      });
      expect(mockPrisma.diningTable.update).toHaveBeenCalledWith({
        where: { id: 'tbl-2' },
        data: { status: 'seated' },
      });
    });

    it('should merge multiple dining tables for a large banquet party', async () => {
      const res = await outletService.mergeTables({
        primaryTableId: 'tbl-1',
        mergedTableIds: ['tbl-2'],
      });
      expect(res.message).toContain('Tables merged successfully');
      expect(mockPrisma.diningTable.update).toHaveBeenCalledWith({
        where: { id: 'tbl-1' },
        data: { status: 'dining' },
      });
    });
  });

  describe('POS Orders, Pricing & Splitting', () => {
    it('should ring up an order with 10% service charge and 5% dining tax', async () => {
      const order = await orderService.createOrder('t-1', {
        outletId: 'out-1',
        tableId: 'tbl-1',
        guestCount: 2,
        items: [
          {
            itemName: 'Prime Ribeye Steak',
            quantity: 2,
            unitPrice: 50.0,
            modifiers: [{ name: 'Truffle Butter', price: 5.0 }],
          },
        ],
      });

      // Subtotal = (50 + 5) * 2 = 110.0
      // Service Charge 10% = 11.0
      // Tax 5% = 5.5
      // Total = 126.5
      expect(order.subtotal).toBe(110);
      expect(order.serviceCharge).toBe(11);
      expect(order.taxAmount).toBe(5.5);
      expect(order.totalAmount).toBe(126.5);
      expect(mockPrisma.diningTable.update).toHaveBeenCalledWith({
        where: { id: 'tbl-1' },
        data: { status: 'cooking' },
      });
    });

    it('should calculate an even split check across guests', async () => {
      const split = await orderService.splitCheck('ord-101', { splitCount: 2 });
      expect(split.splitCount).toBe(2);
      expect(split.splits).toHaveLength(2);
      expect(split.splits[0].amount).toBe(57.5);
      expect(split.splits[1].amount).toBe(57.5);
    });
  });

  describe('Kitchen Display System (KDS) & Order Alerts', () => {
    it('should return active tickets and flag pulsing red alert for orders > 15 mins', async () => {
      const queue = await kdsService.getActiveKitchenQueue('out-1');
      expect(queue).toHaveLength(1);
      expect(queue[0].isDelayedAlert).toBe(true);
      expect(queue[0].waitTimeMinutes).toBeGreaterThanOrEqual(15);
    });

    it('should transition ticket state from cooking to served', async () => {
      const updated = await kdsService.updateKitchenOrderStatus('tkt-1', { status: 'served' });
      expect(updated.status).toBe('served');
      expect(mockPrisma.diningTable.update).toHaveBeenCalledWith({
        where: { id: 'tbl-1' },
        data: { status: 'dining' },
      });
    });
  });

  describe('Two-Way Room Charge & Folio Posting', () => {
    it('should verify occupied room and return guest details and folio limit', async () => {
      const verification = await roomChargeService.verifyRoomForCharge('prop-1', '402');
      expect(verification.isOccupied).toBe(true);
      expect(verification.guestName).toBe('David Miller');
      expect(verification.creditLimit).toBe(2000.0);
    });

    it('should post room charge directly as debit to guest folio and settle order', async () => {
      const res = await roomChargeService.chargeToRoom({
        orderId: 'ord-101',
        roomNumber: '402',
        guestName: 'David Miller',
        amount: 115.0,
        signatureUrl: 'data:image/png;base64,guest_sig_hash',
      });

      expect(res.success).toBe(true);
      expect(res.message).toContain('posted directly to Room 402 folio');
      expect(mockPrisma.folioTransaction.create).toHaveBeenCalledWith({
        data: {
          folioId: 'fol-101',
          transactionType: 'charge',
          department: 'pos_restaurant',
          amount: 115.0,
        },
      });
      expect(mockPrisma.guestFolio.update).toHaveBeenCalled();
    });
  });

  describe('Cashier Shifts & X/Z Balancing', () => {
    it('should open shift with standard $500 float', async () => {
      const shift = await shiftService.openShift({
        terminalId: 'term-1',
        cashierName: 'Emily Watson',
        openingFloat: 500.0,
      });
      expect(shift.openingFloat).toBe(500.0);
      expect(shift.cashierName).toBe('Emily Watson');
    });

    it('should generate mid-shift X-Report audit snapshot', async () => {
      const xRep = await shiftService.generateXReport('shift-1');
      expect(xRep.reportType).toContain('X-Report');
      expect(xRep.openingFloat).toBe(500.0);
      expect(xRep.cashDropsTotal).toBe(200.0);
    });

    it('should close shift and generate permanent Z-Report with cash variance', async () => {
      const zRep = await shiftService.closeShiftAndGenerateZReport('shift-1', {
        physicalCashCounted: 300.0,
      });
      expect(zRep.reportType).toContain('Z-Report');
      expect(zRep.discrepancyStatus).toBe('BALANCED');
    });
  });
});
