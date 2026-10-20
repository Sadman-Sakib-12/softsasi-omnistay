import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpaceService } from './space.service.js';
import { TourService } from './tour.service.js';
import { CarService } from './car.service.js';
import { BoatService } from './boat.service.js';
import { EventService } from './event.service.js';
import { FlightService } from './flight.service.js';
import { CartService } from './cart.service.js';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('Phase 3: Multi-Vertical Travel Engine & Universal Cart', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      space: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      spaceBooking: {
        create: vi.fn(),
      },
      tour: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      tourBooking: {
        create: vi.fn(),
      },
      car: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      carBooking: {
        create: vi.fn(),
      },
      boat: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      boatBooking: {
        create: vi.fn(),
      },
      event: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      eventTicketTier: {
        update: vi.fn(),
      },
      eventBooking: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      eventQrScan: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      airport: {
        findMany: vi.fn(),
        upsert: vi.fn(),
      },
      airline: {
        findMany: vi.fn(),
        upsert: vi.fn(),
      },
      flight: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      flightSeat: {
        updateMany: vi.fn(),
      },
      flightPassenger: {
        create: vi.fn(),
      },
      flightBooking: {
        create: vi.fn(),
      },
      cart: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      cartItem: {
        create: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn(),
      },
      organization: {
        findFirst: vi.fn(),
      },
      travelVoucher: {
        create: vi.fn(),
      },
    };
  });

  describe('5.1 Space & Coworking Service', () => {
    let service: SpaceService;

    beforeEach(() => {
      service = new SpaceService(mockPrisma);
    });

    it('should list spaces with venueType and minCapacity filters', async () => {
      mockPrisma.space.findMany.mockResolvedValue([
        { id: 'spc-1', title: 'Grand Executive Boardroom', venueType: 'meeting_room', capacityPax: 20 },
      ]);

      const result = await service.listSpaces('tenant-1', { venueType: 'meeting_room', minCapacity: 10 });
      expect(result).toHaveLength(1);
      expect(mockPrisma.space.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            venueType: 'meeting_room',
            capacityPax: { gte: 10 },
          }),
        }),
      );
    });

    it('should create space with hourlyPrice, cleaning fee and amenities', async () => {
      mockPrisma.space.create.mockResolvedValue({
        id: 'spc-1',
        title: 'Boardroom A',
        hourlyPrice: 75,
        amenities: [{ name: 'Wi-Fi 6' }],
      });

      const caller: any = { isSuperAdmin: true, permissions: [] };
      const result = await service.createSpace(
        {
          title: 'Boardroom A',
          venueType: 'meeting_room',
          hourlyPrice: 75,
          capacityPax: 12,
          amenities: ['Wi-Fi 6'],
        },
        'tenant-1',
        caller,
      );

      expect(result.id).toBe('spc-1');
      expect(mockPrisma.space.create).toHaveBeenCalled();
    });

    it('should book space and compute duration and total amount', async () => {
      mockPrisma.space.findUnique.mockResolvedValue({
        id: 'spc-1',
        hourlyPrice: 50,
        cleaningFee: 20,
      });
      mockPrisma.spaceBooking.create.mockResolvedValue({
        id: 'sb-1',
        totalAmount: 170, // 3 hours * 50 + 20 cleaning fee
      });

      const result = await service.bookSpace(
        {
          spaceId: 'spc-1',
          startTime: '2026-11-01T09:00:00Z',
          endTime: '2026-11-01T12:00:00Z',
        },
        'user-1',
      );

      expect(mockPrisma.spaceBooking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            spaceId: 'spc-1',
            userId: 'user-1',
            totalAmount: 170,
          }),
        }),
      );
      expect(result.id).toBe('sb-1');
    });
  });

  describe('5.2 Tour Operator Service', () => {
    let service: TourService;

    beforeEach(() => {
      service = new TourService(mockPrisma);
    });

    it('should create tour with day-by-day itineraries and person types', async () => {
      mockPrisma.tour.create.mockResolvedValue({
        id: 'tour-1',
        title: 'Coral Reef Expedition',
        durationDays: 3,
        basePriceAdult: 300,
      });

      const caller: any = { role: 'Company Owner/GM', permissions: [] };
      const result = await service.createTour(
        {
          title: 'Coral Reef Expedition',
          durationDays: 3,
          basePriceAdult: 300,
          itineraries: [{ dayNumber: 1, title: 'Snorkeling at Blue Lagoon' }],
          personTypes: [{ name: 'Adult', price: 300 }, { name: 'Child', price: 180 }],
          inclusions: ['Hotel Transfer', 'Snorkel Equipment'],
        },
        'tenant-1',
        caller,
      );

      expect(result.id).toBe('tour-1');
      expect(mockPrisma.tour.create).toHaveBeenCalled();
    });

    it('should book tour and calculate adult and child tiered pricing', async () => {
      mockPrisma.tour.findUnique.mockResolvedValue({
        id: 'tour-1',
        maxPax: 15,
        basePriceAdult: 200,
        personTypes: [{ name: 'child', price: 100 }],
      });
      mockPrisma.tourBooking.create.mockResolvedValue({
        id: 'tb-1',
        totalAmount: 500, // 2 adults (400) + 1 child (100)
      });

      const result = await service.bookTour(
        {
          tourId: 'tour-1',
          bookingDate: '2026-11-20',
          paxAdults: 2,
          paxChildren: 1,
        },
        'user-1',
      );

      expect(mockPrisma.tourBooking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 500,
            paxAdults: 2,
            paxChildren: 1,
          }),
        }),
      );
      expect(result.id).toBe('tb-1');
    });

    it('should reject booking exceeding tour max capacity', async () => {
      mockPrisma.tour.findUnique.mockResolvedValue({
        id: 'tour-1',
        maxPax: 5,
        basePriceAdult: 100,
        personTypes: [],
      });

      await expect(
        service.bookTour(
          {
            tourId: 'tour-1',
            bookingDate: '2026-11-20',
            paxAdults: 6,
          },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('5.3 Car Rental & Fleet Service', () => {
    let service: CarService;

    beforeEach(() => {
      service = new CarService(mockPrisma);
    });

    it('should create car with transmission, fuel type and daily rate', async () => {
      mockPrisma.car.create.mockResolvedValue({
        id: 'car-1',
        title: 'Mercedes E-Class',
        category: 'luxury_sedan',
        dailyPrice: 150,
      });

      const caller: any = { role: 'General Manager (GM)', permissions: [] };
      const result = await service.createCar(
        {
          title: 'Mercedes E-Class',
          category: 'luxury_sedan',
          dailyPrice: 150,
          transmission: 'Automatic',
          passengerSeats: 5,
          pickupLocations: [{ stationName: 'Airport Terminal 1' }],
        },
        'tenant-1',
        caller,
      );

      expect(result.id).toBe('car-1');
      expect(mockPrisma.car.create).toHaveBeenCalled();
    });

    it('should book rental car and calculate multi-day rental price', async () => {
      mockPrisma.car.findUnique.mockResolvedValue({
        id: 'car-1',
        dailyPrice: 100,
      });
      mockPrisma.carBooking.create.mockResolvedValue({
        id: 'cb-1',
        totalAmount: 300, // 3 days * 100
      });

      const result = await service.bookCar(
        {
          carId: 'car-1',
          pickupDate: '2026-11-10T10:00:00Z',
          dropoffDate: '2026-11-13T10:00:00Z',
        },
        'user-1',
      );

      expect(mockPrisma.carBooking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 300,
          }),
        }),
      );
      expect(result.id).toBe('cb-1');
    });
  });

  describe('5.4 Boat & Yacht Charter Service', () => {
    let service: BoatService;

    beforeEach(() => {
      service = new BoatService(mockPrisma);
    });

    it('should create vessel with staterooms, crewing and daily price', async () => {
      mockPrisma.boat.create.mockResolvedValue({
        id: 'boat-1',
        title: 'Azimut 60',
        vesselType: 'luxury_yacht',
        dailyPrice: 2000,
      });

      const caller: any = { isSuperAdmin: true, permissions: [] };
      const result = await service.createBoat(
        {
          title: 'Azimut 60',
          vesselType: 'luxury_yacht',
          guestCapacity: 12,
          dailyPrice: 2000,
          charterType: 'crewed',
          crewing: [{ role: 'Captain', crewCount: 1 }],
          staterooms: [{ name: 'Master Suite', bedType: 'King' }],
        },
        'tenant-1',
        caller,
      );

      expect(result.id).toBe('boat-1');
      expect(mockPrisma.boat.create).toHaveBeenCalled();
    });

    it('should book yacht charter for multi-day voyage', async () => {
      mockPrisma.boat.findUnique.mockResolvedValue({
        id: 'boat-1',
        dailyPrice: 1500,
      });
      mockPrisma.boatBooking.create.mockResolvedValue({
        id: 'bb-1',
        totalAmount: 3000, // 2 days * 1500
      });

      const result = await service.bookBoat(
        {
          boatId: 'boat-1',
          charterStart: '2026-12-01T08:00:00Z',
          charterEnd: '2026-12-03T08:00:00Z',
        },
        'user-1',
      );

      expect(result.id).toBe('bb-1');
      expect(mockPrisma.boatBooking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 3000,
          }),
        }),
      );
    });
  });

  describe('5.5 Event Ticketing & Gate QR Scanner Service', () => {
    let service: EventService;

    beforeEach(() => {
      service = new EventService(mockPrisma);
    });

    it('should create event with ticket tiers and time slots', async () => {
      mockPrisma.event.create.mockResolvedValue({
        id: 'evt-1',
        title: 'Global Hospitality Summit',
        eventType: 'conference',
      });

      const caller: any = { role: 'Company Owner / GM', permissions: [] };
      const result = await service.createEvent(
        {
          title: 'Global Hospitality Summit',
          eventType: 'conference',
          venueAddress: 'Grand Ballroom, OmniStay Miami',
          startDate: '2026-11-20T08:00:00Z',
          endDate: '2026-11-21T18:00:00Z',
          maxCapacity: 500,
          ticketTiers: [{ name: 'VIP', price: 250, totalSeats: 100 }],
        },
        'tenant-1',
        caller,
      );

      expect(result.id).toBe('evt-1');
      expect(mockPrisma.event.create).toHaveBeenCalled();
    });

    it('should book event tickets and generate HMAC encrypted QR ticket code', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({
        id: 'evt-1',
        slug: 'hospitality-summit',
        ticketTiers: [{ id: 'tier-vip', name: 'VIP', price: 250, totalSeats: 100, bookedSeats: 10 }],
      });
      mockPrisma.eventTicketTier.update.mockResolvedValue({});
      mockPrisma.eventBooking.create.mockImplementation(({ data }) => Promise.resolve({ id: 'eb-1', ...data }));

      const result = await service.bookEvent(
        {
          eventId: 'evt-1',
          ticketTierId: 'tier-vip',
          quantity: 2,
        },
        'user-1',
      );

      expect(result.id).toBe('eb-1');
      expect(result.quantity).toBe(2);
      expect(result.totalAmount).toBe(500);
      expect(result.ticketCode).toMatch(/^EVT-HOSP-[A-F0-9]{8}-[A-F0-9]{8}$/);
      expect(mockPrisma.eventTicketTier.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tier-vip' },
          data: { bookedSeats: { increment: 2 } },
        }),
      );
    });

    it('should successfully verify QR code on first scan at gate', async () => {
      mockPrisma.eventBooking.findUnique.mockResolvedValue({
        id: 'eb-1',
        eventId: 'evt-1',
        ticketCode: 'EVT-VALID-CODE',
        quantity: 2,
        event: { title: 'Global Hospitality Summit' },
      });
      mockPrisma.eventQrScan.findFirst.mockResolvedValue(null); // not scanned before
      mockPrisma.eventQrScan.create.mockResolvedValue({
        id: 'scan-1',
        scannedAt: new Date(),
        isSuccess: true,
      });

      const result = await service.scanQrTicket({ ticketCode: 'EVT-VALID-CODE', gateName: 'Gate A' });
      expect(result.status).toBe('verified');
      expect(result.gate).toBe('Gate A');
      expect(mockPrisma.eventQrScan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isSuccess: true, gateName: 'Gate A' }),
        }),
      );
    });

    it('should detect duplicate entry fraud on second scan and reject with ConflictException', async () => {
      mockPrisma.eventBooking.findUnique.mockResolvedValue({
        id: 'eb-1',
        eventId: 'evt-1',
        ticketCode: 'EVT-ALREADY-USED',
        event: { title: 'Global Hospitality Summit' },
      });
      mockPrisma.eventQrScan.findFirst.mockResolvedValue({
        id: 'prev-scan',
        scannedAt: new Date('2026-11-20T08:30:00Z'),
        isSuccess: true,
      });

      await expect(service.scanQrTicket({ ticketCode: 'EVT-ALREADY-USED' })).rejects.toThrow(ConflictException);
      expect(mockPrisma.eventQrScan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isSuccess: false }),
        }),
      );
    });
  });

  describe('5.6 Flight Booking & Aviation Service', () => {
    let service: FlightService;

    beforeEach(() => {
      service = new FlightService(mockPrisma);
    });

    it('should register airports and airlines', async () => {
      mockPrisma.airport.upsert.mockResolvedValue({ iataCode: 'MIA', name: 'Miami International' });
      mockPrisma.airline.upsert.mockResolvedValue({ iataCode: 'OA', name: 'OmniAir' });

      const apt = await service.createAirport({ iataCode: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA' });
      const air = await service.createAirline({ iataCode: 'OA', name: 'OmniAir', country: 'USA' });

      expect(apt.iataCode).toBe('MIA');
      expect(air.iataCode).toBe('OA');
    });

    it('should book flight and register passenger manifest for TSA compliance', async () => {
      mockPrisma.flight.findUnique.mockResolvedValue({
        id: 'flt-1',
        flightNumber: 'OA-101',
        basePrice: 350,
      });
      mockPrisma.flightPassenger.create.mockResolvedValue({ id: 'p-1' });
      mockPrisma.flightSeat.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.flightBooking.create.mockResolvedValue({
        id: 'fb-1',
        totalAmount: 350,
        ticketCode: 'BRD-OA-101-X7A',
      });

      const result = await service.bookFlight(
        {
          flightId: 'flt-1',
          passengers: [
            {
              passportNo: 'A12345678',
              fullName: 'Sadman Sakib',
              nationality: 'Bangladeshi',
              dateOfBirth: '1998-05-14',
              seatNumber: '1A',
            },
          ],
        },
        'user-1',
      );

      expect(result.id).toBe('fb-1');
      expect(mockPrisma.flightPassenger.create).toHaveBeenCalled();
      expect(mockPrisma.flightSeat.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { flightId: 'flt-1', seatNumber: '1A' },
          data: { isBooked: true },
        }),
      );
    });
  });

  describe('6.1 Universal Cross-Vertical Cart & Vacation Bundling', () => {
    let service: CartService;

    beforeEach(() => {
      service = new CartService(mockPrisma);
    });

    it('should create cart and add cross-vertical items', async () => {
      mockPrisma.cart.findUnique
        .mockResolvedValueOnce(null) // first getOrCreateCart
        .mockResolvedValue({
          id: 'cart-1',
          sessionId: 'sess-1',
          status: 'active',
          currency: 'USD',
          items: [
            { id: 'item-1', vertical: 'hotel', title: 'Ocean Suite', quantity: 1, unitPrice: 200 },
          ],
        });
      mockPrisma.organization.findFirst.mockResolvedValue({ id: 'org-1' });
      mockPrisma.cart.create.mockResolvedValue({ id: 'cart-1', sessionId: 'sess-1', status: 'active', currency: 'USD', items: [] });
      mockPrisma.cartItem.create.mockResolvedValue({ id: 'item-1' });

      const summary = await service.addItemToCart('sess-1', 'tenant-1', {
        vertical: 'hotel',
        entityId: 'room-1',
        title: 'Ocean Suite',
        unitPrice: 200,
        quantity: 1,
      });

      expect(summary.itemCount).toBe(1);
      expect(summary.subtotal).toBe(200);
      expect(summary.bundleDiscountPercent).toBe(0); // single vertical = 0%
    });

    it('should apply 10% vacation bundling discount when 2 distinct verticals are in cart', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        sessionId: 'sess-bundle-2',
        status: 'active',
        currency: 'USD',
        items: [
          { id: 'i-1', vertical: 'hotel', title: '5-Night Deluxe Suite', quantity: 1, unitPrice: 1000 },
          { id: 'i-2', vertical: 'car', title: 'Mercedes SUV Rental', quantity: 1, unitPrice: 500 },
        ],
      });

      const summary = await service.getCartSummary('sess-bundle-2');
      expect(summary.subtotal).toBe(1500);
      expect(summary.distinctVerticalCount).toBe(2);
      expect(summary.bundleDiscountPercent).toBe(10);
      expect(summary.bundleDiscountAmount).toBe(150); // 10% of 1500
      expect(summary.grandTotal).toBe(1417.5); // (1500 - 150) * 1.05 tax = 1350 * 1.05 = 1417.5
    });

    it('should apply 15% premier vacation bundling discount when 3 or more distinct verticals are in cart', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        sessionId: 'sess-bundle-3',
        status: 'active',
        currency: 'USD',
        items: [
          { id: 'i-1', vertical: 'hotel', title: 'Hotel Stay', quantity: 1, unitPrice: 1000 },
          { id: 'i-2', vertical: 'car', title: 'Car Rental', quantity: 1, unitPrice: 400 },
          { id: 'i-3', vertical: 'tour', title: 'Reef Tour', quantity: 2, unitPrice: 300 }, // 600
        ],
      });

      const summary = await service.getCartSummary('sess-bundle-3');
      expect(summary.subtotal).toBe(2000);
      expect(summary.distinctVerticalCount).toBe(3);
      expect(summary.bundleDiscountPercent).toBe(15);
      expect(summary.bundleDiscountAmount).toBe(300); // 15% of 2000 = 300
      expect(summary.grandTotal).toBe(1785); // 1700 * 1.05 = 1785
    });

    it('should checkout cart, mark cart checked_out and issue travel voucher code', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        sessionId: 'sess-checkout',
        status: 'active',
        currency: 'USD',
        items: [
          { id: 'i-1', vertical: 'hotel', entityId: 'room-1', title: 'Hotel Stay', quantity: 1, unitPrice: 800 },
          { id: 'i-2', vertical: 'tour', entityId: 'tour-1', title: 'Island Tour', quantity: 1, unitPrice: 200 },
        ],
      });
      mockPrisma.cart.update.mockResolvedValue({});
      mockPrisma.travelVoucher.create.mockResolvedValue({
        voucherCode: 'VCH-TEST-CODE',
        qrCodeUrl: 'https://api.omnistay.com/vouchers/qr',
        pdfUrl: 'https://api.omnistay.com/vouchers/download.pdf',
      });

      const confirmation = await service.checkoutCart(
        {
          sessionId: 'sess-checkout',
          paymentMethod: 'stripe',
          guestDetails: {
            fullName: 'Sadman Sakib',
            email: 'sakib@softsasi.com',
          },
        },
        { userId: 'usr-1', name: 'Sadman Sakib', email: 'sakib@softsasi.com', permissions: [], isSuperAdmin: false, is2faVerified: true },
      );

      expect(confirmation.success).toBe(true);
      expect(confirmation.voucherCode).toMatch(/^VCH-[A-F0-9]{8}-[A-F0-9]{6}$/);
      expect(confirmation.itinerary.bundledVerticals).toEqual(['hotel', 'tour']);
      expect(confirmation.itinerary.bundleDiscountPercent).toBe(10);
      expect(confirmation.itinerary.bundleDiscountSaved).toBe(100);
      expect(mockPrisma.cart.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { sessionId: 'sess-checkout' },
          data: { status: 'checked_out' },
        }),
      );
    });
  });
});
