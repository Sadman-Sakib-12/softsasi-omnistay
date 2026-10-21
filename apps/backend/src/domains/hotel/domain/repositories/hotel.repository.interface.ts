export const HOTEL_REPOSITORY_TOKEN = Symbol('IHotelRepository');

export interface IHotelRepository {
  // Properties / Hotels
  findHotels(organizationId: string): Promise<any[]>;
  findHotelById(id: string): Promise<any | null>;
  findHotelByCode(organizationId: string, code: string): Promise<any | null>;
  createHotel(data: any): Promise<any>;
  updateHotel(id: string, data: Record<string, any>): Promise<any>;

  // Room Types
  findRoomTypes(propertyId: string): Promise<any[]>;
  findRoomTypeById(id: string): Promise<any | null>;
  createRoomType(data: any): Promise<any>;
  updateRoomType(id: string, data: Record<string, any>): Promise<any>;

  // Rooms
  findRooms(propertyId: string, roomTypeId?: string): Promise<any[]>;
  findRoomById(id: string): Promise<any | null>;
  createRoom(data: any): Promise<any>;
  updateRoom(id: string, data: Record<string, any>): Promise<any>;

  // Rates & Calendar
  findRatePlans(propertyId: string): Promise<any[]>;
  createRatePlan(data: any): Promise<any>;
  findDailyRates(propertyId: string, startDate: Date, endDate: Date): Promise<any[]>;
  upsertDailyRate(data: any): Promise<any>;

  // Bookings
  createBooking(data: any): Promise<any>;
  findBookingById(id: string): Promise<any | null>;
  findBookingByCode(bookingCode: string): Promise<any | null>;
  findBookings(propertyId: string, options?: Record<string, any>): Promise<any[]>;
  updateBooking(id: string, data: Record<string, any>): Promise<any>;

  // Folios
  findFolioById(id: string): Promise<any | null>;
  findFoliosByBooking(bookingId: string): Promise<any[]>;
  createFolio(data: any): Promise<any>;
  createFolioTransaction(data: any): Promise<any>;
  updateFolio(id: string, data: Record<string, any>): Promise<any>;

  // Housekeeping
  findHousekeepingTasks(propertyId: string, status?: string): Promise<any[]>;
  createHousekeepingTask(data: any): Promise<any>;
  updateHousekeepingTask(id: string, data: Record<string, any>): Promise<any>;

  // Maintenance
  findMaintenanceTickets(propertyId: string): Promise<any[]>;
  createMaintenanceTicket(data: any): Promise<any>;
  updateMaintenanceTicket(id: string, data: Record<string, any>): Promise<any>;

  // iCal
  findIcalFeeds(propertyId: string): Promise<any[]>;
  createIcalFeed(data: any): Promise<any>;
  updateIcalFeed(id: string, data: Record<string, any>): Promise<any>;
}
