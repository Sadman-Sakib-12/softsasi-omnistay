export type TravelVertical = 'hotel' | 'tour' | 'car' | 'space' | 'boat' | 'event' | 'flight';

export interface CartItemModel {
  id: string;
  vertical: TravelVertical;
  entityId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  metadata?: Record<string, any>;
}

export interface VacationCartSummary {
  cartId: string | null;
  sessionId: string;
  status: string;
  currency: string;
  itemCount: number;
  distinctVerticalCount: number;
  bundledVerticals: TravelVertical[];
  subtotal: number;
  bundleDiscountPercent: number;
  bundleDiscountAmount: number;
  taxAmount: number;
  grandTotal: number;
  items: CartItemModel[];
}
