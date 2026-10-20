export interface HotelSummary {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  timezone: string;
  currency: string;
  propertyType: string;
  starRating?: number;
  status: string;
}

export interface TapeChartReservationCell {
  bookingId: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'confirmed' | 'checked_in' | 'due_out' | 'checked_out' | 'maintenance';
}

export interface RoomTapeChartRow {
  roomId: string;
  roomNumber: string;
  roomTypeTitle: string;
  cleanlinessStatus: 'clean' | 'dirty' | 'inspected';
  operationalStatus: 'available' | 'ooo' | 'oos';
  timeline: Record<string, TapeChartReservationCell | null>;
}
