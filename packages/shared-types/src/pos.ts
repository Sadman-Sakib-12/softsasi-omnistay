export type TableStatus = 'vacant' | 'seated' | 'cooking' | 'dining' | 'check_printed' | 'cleaning';
export type KdsOrderStatus = 'queued' | 'cooking' | 'ready' | 'served' | 'cancelled';
export type PosPaymentMode = 'cash' | 'card' | 'room_charge' | 'digital_wallet' | 'split';
export type PosOrderStatus = 'open' | 'sent_to_kitchen' | 'billed' | 'completed' | 'cancelled';

export interface IPosOutlet {
  id: string;
  tenantId: string;
  outletName: string;
  outletType: 'restaurant' | 'bar' | 'spa' | 'gift_shop' | 'room_service';
  isActive: boolean;
}

export interface IDiningTable {
  id: string;
  outletId: string;
  tableNumber: string;
  seatingCap: number;
  status: TableStatus;
  posX: number;
  posY: number;
}

export interface IPosMenuItem {
  id: string;
  categoryId: string;
  itemName: string;
  price: number;
  allergens: string[];
  isAvailable: boolean;
}

export interface IPosOrder {
  id: string;
  outletId: string;
  terminalId?: string;
  tableId?: string;
  orderNumber: string;
  guestCount: number;
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  status: PosOrderStatus;
  serverName?: string;
}

export interface IPosOrderItem {
  id: string;
  orderId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  status: string;
}

export interface IKdsStation {
  id: string;
  outletId: string;
  stationName: string;
  stationType: 'grill' | 'salad' | 'fry' | 'bar' | 'dessert' | 'expo';
}

export interface IPosCashierShift {
  id: string;
  terminalId: string;
  cashierName: string;
  openingFloat: number;
  closingCash?: number;
  startedAt: string;
  endedAt?: string;
}

export interface IPosRoomCharge {
  orderId: string;
  roomNumber: string;
  guestName: string;
  amount: number;
  signatureUrl?: string;
  folioId?: string;
}
