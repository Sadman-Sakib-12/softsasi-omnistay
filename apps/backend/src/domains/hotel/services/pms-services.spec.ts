import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HotelService } from './hotel.service.js';
import { RoomTypeService } from './room-type.service.js';
import { RoomService } from './room.service.js';
import { RateCalendarService } from './rate-calendar.service.js';
import { TapeChartService } from './tape-chart.service.js';
import { BookingService } from './booking.service.js';
import { FolioService } from './folio.service.js';
import { HousekeepingService } from './housekeeping.service.js';
import { MaintenanceService } from './maintenance.service.js';
import { IcalService } from './ical.service.js';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';

describe('Hospitality PMS & Bookings Engine (Unit Tests)', () => {
  let prismaMock: any;
  let hotelService: HotelService;
  let roomTypeService: RoomTypeService;
  let roomService: RoomService;
  let rateCalendarService: RateCalendarService;
  let tapeChartService: TapeChartService;
  let bookingService: BookingService;
  let folioService: FolioService;
  let housekeepingService: HousekeepingService;
  let maintenanceService: MaintenanceService;
  let icalService: IcalService;

  const mockAdminUser: any = {
    userId: 'usr-admin-1',
    organizationId: 'org-1',
    email: 'admin@hotel.com',
    role: 'Company Owner / GM',
    permissions: ['properties:manage', 'rooms:manage', 'rates:manage', 'reservations:manage', 'housekeeping:manage', 'folios:manage', 'maintenance:tickets'],
    isSuperAdmin: false,
  };

  const mockGuestUser: any = {
    userId: 'usr-guest-1',
    organizationId: 'org-1',
    email: 'guest@traveler.com',
    role: 'Hotel Guest (Traveler)',
    permissions: [],
    isSuperAdmin: false,
  };

  beforeEach(() => {
    prismaMock = {
      hotel: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      roomType: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      roomBed: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      room: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      ratePlan: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        updateMany: vi.fn(),
      },
      seasonalRate: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      roomAvailability: {
        findMany: vi.fn(),
        upsert: vi.fn(),
      },
      booking: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      bookingItem: {
        create: vi.fn(),
      },
      bookingGuest: {
        create: vi.fn(),
      },
      guestFolio: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      folioTransaction: {
        create: vi.fn(),
      },
      housekeepingTask: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      housekeepingLog: {
        create: vi.fn(),
      },
      maintenanceWorkOrder: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      maintenanceLog: {
        create: vi.fn(),
      },
      keycardLog: {
        create: vi.fn(),
      },
      icalFeed: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => {
        if (typeof cb === 'function') {
          return cb(prismaMock);
        }
        return Promise.all(cb);
      }),
    };

    hotelService = new HotelService(prismaMock);
    roomTypeService = new RoomTypeService(prismaMock, hotelService);
    roomService = new RoomService(prismaMock, roomTypeService);
    rateCalendarService = new RateCalendarService(prismaMock, hotelService, roomTypeService);
    tapeChartService = new TapeChartService(prismaMock, hotelService);
    bookingService = new BookingService(prismaMock, roomTypeService, roomService);
    folioService = new FolioService(prismaMock);
    housekeepingService = new HousekeepingService(prismaMock, roomService);
    maintenanceService = new MaintenanceService(prismaMock, hotelService, roomService);
    icalService = new IcalService(prismaMock, roomTypeService);
  });

  // --- 1. Room Type & Bed Matrix Tests ---
  describe('RoomTypeService', () => {
    it('should create room type with auto slug and base price', async () => {
      prismaMock.hotel.findFirst.mockResolvedValue({
        id: 'prop-1',
        organizationId: 'org-1',
        name: 'Grand Horizon Resort',
      });
      prismaMock.roomType.findFirst.mockResolvedValue(null);
      prismaMock.roomType.create.mockResolvedValue({
        id: 'rt-1',
        propertyId: 'prop-1',
        title: 'Deluxe Ocean Suite',
        slug: 'deluxe-ocean-suite',
        basePrice: 180,
      });

      const res = await roomTypeService.createRoomType(
        'prop-1',
        { title: 'Deluxe Ocean Suite', basePrice: 180, maxAdults: 2 },
        'org-1',
        mockAdminUser,
      );

      expect(res.title).toBe('Deluxe Ocean Suite');
      expect(prismaMock.roomType.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'deluxe-ocean-suite',
            basePrice: 180,
          }),
        }),
      );
    });

    it('should throw ConflictException if slug already exists', async () => {
      prismaMock.hotel.findFirst.mockResolvedValue({ id: 'prop-1', organizationId: 'org-1' });
      prismaMock.roomType.findFirst.mockResolvedValue({ id: 'rt-existing' });

      await expect(
        roomTypeService.createRoomType(
          'prop-1',
          { title: 'Deluxe Ocean Suite', basePrice: 180 },
          'org-1',
          mockAdminUser,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should add bed configuration to room type', async () => {
      prismaMock.roomType.findFirst.mockResolvedValue({
        id: 'rt-1',
        property: { organizationId: 'org-1' },
      });
      prismaMock.roomBed.create.mockResolvedValue({
        id: 'bed-1',
        roomTypeId: 'rt-1',
        bedType: 'king',
        quantity: 1,
      });

      const res = await roomTypeService.addBed(
        'rt-1',
        { bedType: 'king', quantity: 1 },
        'org-1',
        mockAdminUser,
      );

      expect(res.bedType).toBe('king');
    });
  });

  // --- 2. Physical Room & Status Transition Tests ---
  describe('RoomService', () => {
    it('should create physical room unit under category', async () => {
      prismaMock.roomType.findFirst.mockResolvedValue({
        id: 'rt-1',
        property: { organizationId: 'org-1' },
      });
      prismaMock.room.findFirst.mockResolvedValue(null);
      prismaMock.room.create.mockResolvedValue({
        id: 'room-101',
        roomNumber: '101',
        cleanlinessStatus: 'clean',
        operationalStatus: 'available',
      });

      const res = await roomService.createRoom(
        'rt-1',
        { roomNumber: '101', floor: 1, building: 'Tower A' },
        'org-1',
        mockAdminUser,
      );

      expect(res.roomNumber).toBe('101');
    });

    it('should update room cleanliness and create audit log entry', async () => {
      prismaMock.room.findFirst.mockResolvedValue({
        id: 'room-101',
        cleanlinessStatus: 'dirty',
        operationalStatus: 'available',
        roomType: { property: { organizationId: 'org-1' } },
      });
      prismaMock.room.update.mockResolvedValue({
        id: 'room-101',
        cleanlinessStatus: 'clean',
        operationalStatus: 'available',
      });
      prismaMock.housekeepingLog.create.mockResolvedValue({ id: 'log-1' });

      const res = await roomService.updateRoomStatus(
        'room-101',
        { cleanlinessStatus: 'clean', notes: 'Inspected and disinfected' },
        'org-1',
        mockAdminUser,
      );

      expect(res.cleanlinessStatus).toBe('clean');
      expect(prismaMock.housekeepingLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            roomId: 'room-101',
            statusFrom: 'dirty/available',
            statusTo: 'clean/available',
          }),
        }),
      );
    });
  });

  // --- 3. Dynamic Rate Calendar Tests ---
  describe('RateCalendarService', () => {
    it('should compute dynamic availability grid applying seasonal multiplier', async () => {
      prismaMock.roomType.findFirst.mockResolvedValue({
        id: 'rt-1',
        propertyId: 'prop-1',
        title: 'Deluxe Suite',
        basePrice: 100,
        property: { organizationId: 'org-1' },
      });
      prismaMock.roomAvailability.findMany.mockResolvedValue([]);
      prismaMock.seasonalRate.findMany.mockResolvedValue([
        {
          seasonName: 'Summer Peak',
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-08-31'),
          multiplier: 1.5,
        },
      ]);
      prismaMock.room.count.mockResolvedValue(5);

      const grid = await rateCalendarService.getAvailabilityGrid(
        'rt-1',
        '2026-06-10',
        '2026-06-12',
        'org-1',
      );

      expect(grid.grid.length).toBe(3);
      // Base $100 * 1.5 = $150
      expect(grid.grid[0].price).toBe(150);
      expect(grid.grid[0].totalInventory).toBe(5);
    });
  });

  // --- 4. Tape Chart Matrix Tests ---
  describe('TapeChartService', () => {
    it('should generate 30-day timeline matrix with room statuses', async () => {
      prismaMock.hotel.findFirst.mockResolvedValue({ id: 'prop-1', organizationId: 'org-1' });
      prismaMock.room.findMany.mockResolvedValue([
        {
          id: 'room-101',
          roomNumber: '101',
          floor: 1,
          building: 'Main',
          cleanlinessStatus: 'clean',
          operationalStatus: 'available',
          roomType: { id: 'rt-1', title: 'Deluxe Ocean Suite' },
        },
      ]);
      prismaMock.booking.findMany.mockResolvedValue([]);

      const res = await tapeChartService.getTapeChartData(
        'prop-1',
        '2026-10-19',
        7,
        'org-1',
        mockAdminUser,
      );

      expect(res.timeline.length).toBe(7);
      expect(res.rooms[0].room.roomNumber).toBe('101');
    });
  });

  // --- 5. Booking & Automated Folio Lifecycle Tests ---
  describe('BookingService', () => {
    it('should create booking and auto-provision open guest folio with initial charges', async () => {
      prismaMock.roomType.findFirst.mockResolvedValue({
        id: 'rt-1',
        basePrice: 150,
        property: { organizationId: 'org-1' },
      });

      prismaMock.booking.create.mockResolvedValue({
        id: 'bk-uuid-1',
        bookingCode: 'BK-ABC1234',
        totalAmount: 450,
      });

      prismaMock.guestFolio.create.mockResolvedValue({
        id: 'fol-uuid-1',
        folioNumber: 'FOL-BK-ABC1234',
        totalCharges: 450,
        balanceDue: 350,
      });

      const res = await bookingService.createBooking(
        {
          propertyId: 'prop-1',
          roomTypeId: 'rt-1',
          checkInDate: '2026-11-01',
          checkOutDate: '2026-11-04',
          depositAmount: 100,
        },
        'org-1',
        mockAdminUser,
      );

      expect(res.totalAmount).toBe(450); // 3 nights * $150
      expect(res.balanceDue).toBe(350); // $450 - $100 deposit
      expect(prismaMock.guestFolio.create).toHaveBeenCalled();
      expect(prismaMock.folioTransaction.create).toHaveBeenCalled();
    });

    it('should check in guest and assign RFID keycard', async () => {
      prismaMock.booking.findFirst.mockResolvedValue({
        id: 'bk-1',
        bookingCode: 'BK-100',
        bookingStatus: 'confirmed',
        guest: { name: 'John Doe' },
        bookingGuests: [{ fullName: 'John Doe' }],
      });
      prismaMock.room.findFirst.mockResolvedValue({
        id: 'room-101',
        roomNumber: '101',
        operationalStatus: 'available',
        cleanlinessStatus: 'clean',
        roomType: { property: { organizationId: 'org-1' } },
      });

      const res = await bookingService.checkInGuest(
        { bookingId: 'bk-1', roomId: 'room-101', keycardCode: 'RFID-9942' },
        'org-1',
        mockAdminUser,
      );

      expect(res.roomNumber).toBe('101');
      expect(res.keycardCode).toBe('RFID-9942');
      expect(prismaMock.keycardLog.create).toHaveBeenCalled();
    });

    it('should prevent checkout if outstanding folio balance is unpaid', async () => {
      prismaMock.booking.findFirst.mockResolvedValue({
        id: 'bk-1',
        bookingStatus: 'checked_in',
        folios: [{ id: 'fol-1', balanceDue: 250 }],
        bookingItems: [{ roomTypeId: 'rt-1' }],
        guest: { name: 'John' },
        bookingGuests: [],
      });

      await expect(
        bookingService.checkOutGuest(
          { bookingId: 'bk-1', forceOverrideUnpaid: false },
          'org-1',
          mockAdminUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should complete checkout, close folio, mark room Dirty, and dispatch housekeeping task', async () => {
      prismaMock.booking.findFirst.mockResolvedValue({
        id: 'bk-1',
        bookingCode: 'BK-100',
        bookingStatus: 'checked_in',
        folios: [{ id: 'fol-1', balanceDue: 0 }],
        bookingItems: [{ roomTypeId: 'rt-1' }],
        guest: { name: 'John' },
        bookingGuests: [],
      });

      prismaMock.room.findFirst.mockResolvedValue({
        id: 'room-101',
        roomNumber: '101',
        cleanlinessStatus: 'clean',
      });

      const res = await bookingService.checkOutGuest(
        { bookingId: 'bk-1' },
        'org-1',
        mockAdminUser,
      );

      expect(res.roomCleanlinessStatus).toBe('dirty');
      expect(res.housekeepingDispatched).toBe(true);
      expect(prismaMock.room.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { cleanlinessStatus: 'dirty' },
        }),
      );
      expect(prismaMock.housekeepingTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskType: 'checkout_clean',
            priority: 'high',
          }),
        }),
      );
    });
  });

  // --- 6. Folio Charges & Payments Tests ---
  describe('FolioService', () => {
    it('should post room service dining charge to folio', async () => {
      prismaMock.guestFolio.findUnique.mockResolvedValue({
        id: 'fol-1',
        totalCharges: 100,
        totalPayments: 50,
        balanceDue: 50,
        status: 'open',
        booking: { tenantId: 'org-1' },
      });
      prismaMock.folioTransaction.create.mockResolvedValue({ id: 'txn-1', department: 'pos_restaurant' });
      prismaMock.guestFolio.update.mockResolvedValue({ id: 'fol-1', totalCharges: 145, balanceDue: 95 });

      const res = await folioService.addCharge(
        'fol-1',
        { department: 'pos_restaurant', amount: 45 },
        'org-1',
        mockAdminUser,
      );

      expect(res.amount).toBe(45);
      expect(res.balanceDue).toBe(95);
    });
  });

  // --- 7. Housekeeping Task State Synchronization Tests ---
  describe('HousekeepingService', () => {
    it('should transition room from Dirty to Clean when task completes', async () => {
      prismaMock.housekeepingTask.findFirst.mockResolvedValue({
        id: 'task-1',
        roomId: 'room-101',
        taskType: 'checkout_clean',
        room: {
          cleanlinessStatus: 'dirty',
          roomType: { property: { organizationId: 'org-1' } },
        },
      });

      prismaMock.housekeepingTask.update.mockResolvedValue({
        id: 'task-1',
        status: 'completed',
      });

      const res = await housekeepingService.updateTaskStatus(
        'task-1',
        { status: 'completed', completionNotes: 'Cleaned and sanitized' },
        'org-1',
        mockAdminUser,
      );

      expect(res.roomCleanlinessStatus).toBe('clean');
      expect(prismaMock.room.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { cleanlinessStatus: 'clean' },
        }),
      );
    });
  });

  // --- 8. Maintenance Work Orders & Out-of-Order Blocking Tests ---
  describe('MaintenanceService', () => {
    it('should flag room Out-of-Order (OOO) on emergency work order dispatch', async () => {
      prismaMock.hotel.findFirst.mockResolvedValue({ id: 'prop-1', organizationId: 'org-1' });
      prismaMock.room.findFirst.mockResolvedValue({
        id: 'room-101',
        roomType: { property: { organizationId: 'org-1' } },
      });
      prismaMock.maintenanceWorkOrder.create.mockResolvedValue({
        id: 'wo-1',
        title: 'AC gas leak',
        priority: 'emergency',
        slaHours: 2,
      });

      const res = await maintenanceService.createWorkOrder(
        {
          propertyId: 'prop-1',
          roomId: 'room-101',
          title: 'AC gas leak',
          description: 'Emergency repair required',
          priority: 'emergency',
        },
        'org-1',
        mockAdminUser,
      );

      expect(res.roomBlockedOutOfOrder).toBe(true);
      expect(prismaMock.room.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { operationalStatus: 'ooo' },
        }),
      );
    });
  });

  // --- 9. iCal Feed Engine Tests ---
  describe('IcalService', () => {
    it('should generate RFC 5545 compliant .ics calendar payload', async () => {
      prismaMock.icalFeed.findFirst.mockResolvedValue({
        id: 'feed-1',
        roomTypeId: 'rt-1',
        roomType: {
          title: 'Deluxe Suite',
          property: { name: 'Grand Resort' },
        },
      });

      prismaMock.booking.findMany.mockResolvedValue([
        {
          id: 'bk-1',
          bookingCode: 'BK-100',
          checkInDate: new Date('2026-11-01'),
          checkOutDate: new Date('2026-11-05'),
          createdAt: new Date(),
        },
      ]);

      const ics = await icalService.generateOutboundIcs('test-token');

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('SUMMARY:Reserved (OmniStay #BK-100)');
      expect(ics).toContain('DTSTART;VALUE=DATE:20261101');
      expect(ics).toContain('DTEND;VALUE=DATE:20261105');
      expect(ics).toContain('END:VCALENDAR');
    });
  });
});
