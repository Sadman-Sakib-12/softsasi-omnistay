export const TRAVEL_REPOSITORY_TOKEN = Symbol('ITravelRepository');

export interface ITravelRepository {
  // Cart
  findCartBySession(sessionId: string): Promise<any | null>;
  createCart(data: any): Promise<any>;
  updateCart(sessionId: string, data: any): Promise<any>;
  createCartItem(data: any): Promise<any>;
  updateCartItem(id: string, data: any): Promise<any>;
  deleteCartItem(id: string, cartId: string): Promise<any>;
  clearCartItems(cartId: string): Promise<any>;
  createTravelVoucher(data: any): Promise<any>;

  // Spaces
  findSpaces(tenantId?: string, filters?: Record<string, any>): Promise<any[]>;
  findSpaceById(id: string, tenantId?: string): Promise<any | null>;
  createSpace(data: any): Promise<any>;
  updateSpace(id: string, data: any): Promise<any>;
  createSpaceBooking(data: any): Promise<any>;

  // Tours
  findTours(tenantId?: string, filters?: Record<string, any>): Promise<any[]>;
  findTourById(id: string, tenantId?: string): Promise<any | null>;
  createTour(data: any): Promise<any>;
  updateTour(id: string, data: any): Promise<any>;
  createTourBooking(data: any): Promise<any>;

  // Cars
  findCars(tenantId?: string, filters?: Record<string, any>): Promise<any[]>;
  findCarById(id: string, tenantId?: string): Promise<any | null>;
  createCar(data: any): Promise<any>;
  updateCar(id: string, data: any): Promise<any>;
  createCarBooking(data: any): Promise<any>;

  // Boats
  findBoats(tenantId?: string, filters?: Record<string, any>): Promise<any[]>;
  findBoatById(id: string, tenantId?: string): Promise<any | null>;
  createBoat(data: any): Promise<any>;
  updateBoat(id: string, data: any): Promise<any>;
  createBoatBooking(data: any): Promise<any>;

  // Events
  findEvents(tenantId?: string, filters?: Record<string, any>): Promise<any[]>;
  findEventById(id: string, tenantId?: string): Promise<any | null>;
  createEvent(data: any): Promise<any>;
  updateEvent(id: string, data: any): Promise<any>;
  createEventBooking(data: any): Promise<any>;

  // Flights
  findAirports(): Promise<any[]>;
  upsertAirport(data: any): Promise<any>;
  findAirlines(): Promise<any[]>;
  upsertAirline(data: any): Promise<any>;
  findFlights(tenantId?: string, filters?: Record<string, any>): Promise<any[]>;
  findFlightById(id: string, tenantId?: string): Promise<any | null>;
  createFlight(data: any): Promise<any>;
  createFlightBooking(data: any): Promise<any>;
}
