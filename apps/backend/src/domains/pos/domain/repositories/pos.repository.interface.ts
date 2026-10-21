export const POS_REPOSITORY_TOKEN = Symbol('IPosRepository');

export interface IPosRepository {
  // Outlets & Tables
  createOutlet(data: any): Promise<any>;
  findOutlets(tenantId: string): Promise<any[]>;
  findOutletById(tenantId: string, id: string): Promise<any | null>;
  createTable(data: any): Promise<any>;
  findTableById(id: string): Promise<any | null>;
  updateTable(id: string, data: Record<string, any>): Promise<any>;
  updateManyOrders(where: Record<string, any>, data: Record<string, any>): Promise<any>;

  // Menus & Items
  createMenu(data: any): Promise<any>;
  findMenusByOutlet(outletId: string): Promise<any[]>;
  createCategory(data: any): Promise<any>;
  createMenuItem(data: any): Promise<any>;
  findMenuItemById(id: string): Promise<any | null>;
  updateMenuItem(id: string, data: Record<string, any>): Promise<any>;

  // Orders & Payments
  createOrder(data: any): Promise<any>;
  findOrderById(id: string): Promise<any | null>;
  updateOrder(id: string, data: Record<string, any>): Promise<any>;
  createPayment(data: any): Promise<any>;
  findPaymentsByOrderId(orderId: string): Promise<any[]>;

  // KDS
  createKdsStation(data: any): Promise<any>;
  findDefaultKdsStation(outletId: string): Promise<any | null>;
  createKitchenOrder(data: any): Promise<any>;
  findKdsStationsByOutlet(outletId: string): Promise<any[]>;
  findActiveKitchenOrders(outletId: string): Promise<any[]>;
  findKitchenOrderById(id: string): Promise<any | null>;
  updateKitchenOrder(id: string, data: Record<string, any>): Promise<any>;

  // Room Charge Integration
  findRoomByNumber(propertyId: string, roomNumber: string): Promise<any | null>;
  findActiveBooking(propertyId?: string): Promise<any | null>;
  createFolio(data: any): Promise<any>;
  createFolioTransaction(data: any): Promise<any>;
  updateFolio(folioId: string, data: Record<string, any>): Promise<any>;
  createRoomChargeLog(data: any): Promise<any>;

  // Cashier Shifts & Reports
  findActiveShiftByTerminal(terminalId: string): Promise<any | null>;
  findShiftById(id: string): Promise<any | null>;
  createShift(data: any): Promise<any>;
  createCashDrop(data: any): Promise<any>;
  findPaymentsForShift(terminalId: string, sinceDate: Date): Promise<any[]>;
  createXReport(data: any): Promise<any>;
  createZReport(data: any): Promise<any>;
  updateShift(id: string, data: Record<string, any>): Promise<any>;
}
