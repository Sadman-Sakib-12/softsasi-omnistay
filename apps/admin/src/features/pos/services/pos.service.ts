import { api } from '@/lib/api/client';

export interface PosOutlet {
  id: string;
  tenantId: string;
  outletName: string;
  outletType: 'restaurant' | 'bar' | 'spa' | 'retail';
  isActive: boolean;
  tables?: DiningTableItem[];
  terminals?: PosTerminalItem[];
  kdsStations?: KdsStationItem[];
}

export interface DiningTableItem {
  id: string;
  tableNumber: string;
  seatingCap: number;
  status: 'vacant' | 'seated' | 'cooking' | 'dining' | 'check_printed' | 'cleaning';
  posX: number;
  posY: number;
  currentBill?: number;
  server?: string;
}

export interface PosTerminalItem {
  id: string;
  outletId: string;
  terminalName: string;
  deviceSerial: string;
  isActive: boolean;
}

export interface PosMenuItem {
  id: string;
  categoryId: string;
  itemName: string;
  price: number;
  allergens: string[];
  isAvailable: boolean;
  modifiers?: Array<{ id: string; modifierName: string; priceExtra: number }>;
}

export interface PosMenuCategory {
  id: string;
  menuId: string;
  categoryName: string;
  displayOrder: number;
  items: PosMenuItem[];
}

export interface PosMenu {
  id: string;
  outletId: string;
  menuName: string;
  isActive: boolean;
  categories: PosMenuCategory[];
}

export interface PosOutletDetail extends PosOutlet {
  tables: DiningTableItem[];
  terminals: PosTerminalItem[];
  menus: PosMenu[];
  kdsStations: KdsStationItem[];
}

export interface KdsStationItem {
  id: string;
  stationName: string;
  stationType: string;
}

export interface KdsTicket {
  id: string;
  ticketNumber: string;
  status: 'queued' | 'cooking' | 'ready' | 'served';
  sentAt: string;
  waitTimeMinutes: number;
  isDelayedAlert: boolean;
  order: {
    id: string;
    orderNumber: string;
    table?: { tableNumber: string };
    serverName?: string;
    items: Array<{
      id: string;
      itemName: string;
      quantity: number;
      notes?: string;
    }>;
  };
  station?: {
    stationName: string;
    stationType: string;
  };
}

export interface RoomVerificationResult {
  roomNumber: string;
  isOccupied: boolean;
  guestName?: string;
  guestEmail?: string;
  bookingCode?: string;
  folioId?: string;
  folioNumber?: string;
  currentBalanceDue?: number;
  creditLimit?: number;
  vipStatus?: string;
  message?: string;
}

export interface CashierShift {
  id: string;
  terminalId: string;
  cashierName: string;
  openingFloat: number;
  closingCash?: number;
  startedAt: string;
  endedAt?: string;
  cashDrops?: Array<{ id: string; amount: number; reason: string; droppedAt: string }>;
}

export interface XReportResult {
  reportType: string;
  shiftId: string;
  cashierName: string;
  openedAt: string;
  snapshotTime: string;
  openingFloat: number;
  salesBreakdown: {
    cashTotal: number;
    cardTotal: number;
    roomChargeTotal: number;
    otherTotal: number;
    totalSales: number;
  };
  cashDropsTotal: number;
  expectedDrawerCash: number;
}

export interface ZReportResult {
  reportType: string;
  shiftId: string;
  cashierName: string;
  closedAt: string;
  openingFloat: number;
  salesBreakdown: {
    cashTotal: number;
    cardTotal: number;
    roomChargeTotal: number;
    totalSales: number;
  };
  cashDropsTotal: number;
  expectedDrawerCash: number;
  actualDrawerCash: number;
  discrepancy: number;
  balancingStatus: 'balanced' | 'overage' | 'shortage';
}

export const posService = {
  // 9.1 & 9.2 Outlets, Tables & Floorplans
  getOutlets: async (): Promise<PosOutlet[]> => {
    try {
      const res = await api.get<any>('/api/v1/pos/outlets');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getOutletById: async (outletId: string): Promise<PosOutletDetail | null> => {
    try {
      const res = await api.get<any>(`/api/v1/pos/outlets/${outletId}`);
      return res?.data || res || null;
    } catch {
      return null;
    }
  },

  createTable: async (outletId: string, dto: { tableNumber: string; seatingCap: number; posX?: number; posY?: number }) => {
    return await api.post(`/api/v1/pos/outlets/${outletId}/tables`, dto);
  },

  updateTablePosition: async (tableId: string, posX: number, posY: number) => {
    return await api.patch(`/api/v1/pos/outlets/tables/${tableId}/position`, { posX, posY });
  },

  updateTableStatus: async (tableId: string, status: string) => {
    return await api.patch(`/api/v1/pos/outlets/tables/${tableId}/status/${status}`);
  },

  transferTable: async (sourceTableId: string, targetTableId: string, reason?: string): Promise<any> => {
    return await api.post<any>('/api/v1/pos/outlets/tables/transfer', { sourceTableId, targetTableId, reason });
  },

  mergeTables: async (primaryTableId: string, mergedTableIds: string[]): Promise<any> => {
    return await api.post<any>('/api/v1/pos/outlets/tables/merge', { primaryTableId, mergedTableIds });
  },

  // 9.1 Orders & Terminals
  createOrder: async (dto: {
    outletId: string;
    terminalId?: string;
    tableId?: string;
    guestCount?: number;
    serverName?: string;
    items: Array<{
      itemName: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
      modifiers?: Array<{ name: string; price: number }>;
    }>;
  }): Promise<any> => {
    return await api.post<any>('/api/v1/pos/orders', dto);
  },

  getOrdersByOutlet: async (outletId: string): Promise<any[]> => {
    try {
      const res = await api.get<any>(`/api/v1/pos/orders/outlet/${outletId}`);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  settleOrder: async (orderId: string, dto: { paymentMode: string; amount: number; tipAmount?: number; reference?: string }): Promise<any> => {
    return await api.post<any>(`/api/v1/pos/orders/${orderId}/settle`, dto);
  },

  splitCheck: async (orderId: string, guestCount: number): Promise<any> => {
    return await api.post<any>(`/api/v1/pos/orders/${orderId}/split`, { guestCount });
  },

  // 9.3 Kitchen Display System (KDS)
  getKdsQueue: async (outletId: string): Promise<KdsTicket[]> => {
    try {
      const res = await api.get<any>(`/api/v1/pos/kds/${outletId}/queue`);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  updateKdsTicketStatus: async (ticketId: string, status: 'queued' | 'cooking' | 'ready' | 'served') => {
    return await api.patch(`/api/v1/pos/kds/tickets/${ticketId}/status`, { status });
  },

  // 9.4 Room Charge & Folio Verification
  verifyRoomForCharge: async (propertyId: string, roomNumber: string): Promise<RoomVerificationResult> => {
    const pId = propertyId || '00000000-0000-0000-0000-000000000001';
    const res = await api.get<any>(`/api/v1/pos/room-charge/verify/${pId}/${roomNumber}`);
    return res?.data || res;
  },

  chargeToRoom: async (dto: {
    orderId: string;
    roomNumber: string;
    guestName: string;
    amount: number;
    signatureUrl?: string;
  }) => {
    return await api.post('/api/v1/pos/room-charge/charge', dto);
  },

  // 9.5 Cashier Shift Management & Balancing
  getActiveShift: async (terminalId?: string): Promise<CashierShift | null> => {
    try {
      const url = terminalId ? `/api/v1/pos/shifts/active?terminalId=${terminalId}` : '/api/v1/pos/shifts/active';
      const res = await api.get<any>(url);
      return res?.data || res || null;
    } catch {
      return null;
    }
  },

  openShift: async (dto: { terminalId: string; cashierName: string; openingFloat: number }) => {
    return await api.post('/api/v1/pos/shifts/open', dto);
  },

  recordCashDrop: async (shiftId: string, amount: number, reason?: string) => {
    return await api.post(`/api/v1/pos/shifts/${shiftId}/cash-drop`, { amount, reason });
  },

  getXReport: async (shiftId: string): Promise<XReportResult> => {
    const res = await api.get<any>(`/api/v1/pos/shifts/${shiftId}/x-report`);
    return res?.data || res;
  },

  closeShiftZReport: async (shiftId: string, actualClosingCash: number): Promise<ZReportResult> => {
    const res = await api.post<any>(`/api/v1/pos/shifts/${shiftId}/close-z-report`, { actualClosingCash });
    return res?.data || res;
  },
};
