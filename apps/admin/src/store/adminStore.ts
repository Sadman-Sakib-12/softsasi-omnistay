import { create } from 'zustand';
import { pmsApi, accountingApi, posApi, aiApi, PropertyDto, CreateBookingDto, CheckInDto, CheckOutDto } from '../services/api';

export type AdminViewTab =
  | 'hotels'              // Figure 4.1: All Hotels portfolio
  | 'room-management'     // Figure 3.1: Room Management & Bed Matrix
  | 'availability'        // Figure 4.3: Interactive Dynamic Pricing & Availability Calendar
  | 'tape-chart'          // Real-time Front Desk Tape Chart
  | 'bookings'            // Reservations & Folios
  | 'pos-kds'             // POS & Kitchen Display System
  | 'accounting'          // USALI General Ledger & Night Audit
  | 'ai-concierge'        // Figure 14.1 & 14.2: AI Concierge Agent Configuration
  | 'settings';           // Figure 2.1: Unified Platform Centralized Configuration Hub

interface AdminState {
  // Current view and selected property
  activeTab: AdminViewTab;
  selectedPropertyId: string | null;

  // Real backend entities (NO mock data)
  properties: PropertyDto[];
  rooms: any[];
  tapeChartData: any | null;
  bookings: any[];
  kdsTickets: any[];
  nightAuditLogs: any[];
  aiConfig: any | null;

  // Loading & operational states
  isLoading: boolean;
  errorMessage: string | null;
  backendConnected: boolean;

  // UI Modal controllers
  addHotelModalOpen: boolean;
  addRoomModalOpen: boolean;
  walkInModalOpen: boolean;
  checkInModalOpen: boolean;
  checkOutModalOpen: boolean;
  selectedBooking: any | null;

  // Actions
  setActiveTab: (tab: AdminViewTab) => void;
  setSelectedPropertyId: (id: string | null) => void;
  setAddHotelModalOpen: (open: boolean) => void;
  setAddRoomModalOpen: (open: boolean) => void;
  setWalkInModalOpen: (open: boolean) => void;
  setCheckInModalOpen: (open: boolean) => void;
  setCheckOutModalOpen: (open: boolean) => void;
  setSelectedBooking: (booking: any | null) => void;

  // Real API Calls
  checkBackendHealth: () => Promise<void>;
  fetchProperties: () => Promise<void>;
  createProperty: (payload: PropertyDto) => Promise<PropertyDto>;
  fetchTapeChart: (propertyId?: string, startDate?: string) => Promise<void>;
  fetchBookings: (propertyId?: string, status?: string) => Promise<void>;
  createBooking: (payload: CreateBookingDto) => Promise<any>;
  checkInGuest: (payload: CheckInDto) => Promise<any>;
  checkOutGuest: (payload: CheckOutDto) => Promise<any>;
  runNightAudit: (auditDate?: string) => Promise<any>;
  fetchKdsQueue: (outletId: string) => Promise<void>;
  updateKdsTicket: (ticketId: string, status: string) => Promise<void>;
  fetchAiConfig: () => Promise<void>;
  updateAiConfig: (config: any) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  activeTab: 'hotels',
  selectedPropertyId: null,

  properties: [],
  rooms: [],
  tapeChartData: null,
  bookings: [],
  kdsTickets: [],
  nightAuditLogs: [],
  aiConfig: null,

  isLoading: false,
  errorMessage: null,
  backendConnected: false,

  addHotelModalOpen: false,
  addRoomModalOpen: false,
  walkInModalOpen: false,
  checkInModalOpen: false,
  checkOutModalOpen: false,
  selectedBooking: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedPropertyId: (id) => set({ selectedPropertyId: id }),
  setAddHotelModalOpen: (open) => set({ addHotelModalOpen: open }),
  setAddRoomModalOpen: (open) => set({ addRoomModalOpen: open }),
  setWalkInModalOpen: (open) => set({ walkInModalOpen: open }),
  setCheckInModalOpen: (open) => set({ checkInModalOpen: open }),
  setCheckOutModalOpen: (open) => set({ checkOutModalOpen: open }),
  setSelectedBooking: (booking) => set({ selectedBooking: booking }),

  checkBackendHealth: async () => {
    try {
      const res = await fetch('http://localhost:4000/api/v1/health').catch(() => null);
      if (res && res.ok) {
        set({ backendConnected: true });
      } else {
        set({ backendConnected: false });
      }
    } catch {
      set({ backendConnected: false });
    }
  },

  fetchProperties: async () => {
    set({ isLoading: true, errorMessage: null });
    try {
      const list = await pmsApi.listProperties();
      set({
        properties: Array.isArray(list) ? list : [],
        selectedPropertyId: list && list.length > 0 ? (list[0].id || null) : null,
        backendConnected: true,
      });
    } catch (err: any) {
      set({ errorMessage: err.message, properties: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  createProperty: async (payload: PropertyDto) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const created = await pmsApi.createProperty(payload);
      set((state) => ({
        properties: [created, ...state.properties],
        addHotelModalOpen: false,
        backendConnected: true,
      }));
      return created;
    } catch (err: any) {
      set({ errorMessage: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTapeChart: async (propertyId?: string, startDate?: string) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const propId = propertyId || get().selectedPropertyId || undefined;
      const data = await pmsApi.getTapeChart({ propertyId: propId, startDate, days: 30 });
      set({ tapeChartData: data, backendConnected: true });
    } catch (err: any) {
      set({ errorMessage: err.message, tapeChartData: null });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBookings: async (propertyId?: string, status?: string) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const propId = propertyId || get().selectedPropertyId || undefined;
      const list = await pmsApi.listBookings({ propertyId: propId, bookingStatus: status });
      set({ bookings: Array.isArray(list) ? list : [], backendConnected: true });
    } catch (err: any) {
      set({ errorMessage: err.message, bookings: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  createBooking: async (payload: CreateBookingDto) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const booking = await pmsApi.createBooking(payload);
      set({ walkInModalOpen: false, backendConnected: true });
      await get().fetchBookings();
      return booking;
    } catch (err: any) {
      set({ errorMessage: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  checkInGuest: async (payload: CheckInDto) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const res = await pmsApi.checkInGuest(payload);
      set({ checkInModalOpen: false, backendConnected: true });
      await get().fetchBookings();
      return res;
    } catch (err: any) {
      set({ errorMessage: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  checkOutGuest: async (payload: CheckOutDto) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const res = await pmsApi.checkOutGuest(payload);
      set({ checkOutModalOpen: false, backendConnected: true });
      await get().fetchBookings();
      return res;
    } catch (err: any) {
      set({ errorMessage: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  runNightAudit: async (auditDate?: string) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const res = await accountingApi.runNightAudit(auditDate);
      set({ backendConnected: true });
      return res;
    } catch (err: any) {
      set({ errorMessage: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchKdsQueue: async (outletId: string) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const queue = await posApi.getKdsQueue(outletId);
      set({ kdsTickets: Array.isArray(queue) ? queue : [], backendConnected: true });
    } catch (err: any) {
      set({ errorMessage: err.message, kdsTickets: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  updateKdsTicket: async (ticketId: string, status: string) => {
    try {
      await posApi.updateTicketStatus(ticketId, status);
      set((state) => ({
        kdsTickets: state.kdsTickets.map((t) => (t.id === ticketId ? { ...t, status } : t)),
        backendConnected: true,
      }));
    } catch (err: any) {
      set({ errorMessage: err.message });
    }
  },

  fetchAiConfig: async () => {
    try {
      const cfg = await aiApi.getConfig();
      set({ aiConfig: cfg, backendConnected: true });
    } catch (err: any) {
      set({ errorMessage: err.message });
    }
  },

  updateAiConfig: async (config: any) => {
    set({ isLoading: true, errorMessage: null });
    try {
      await aiApi.updateConfig(config);
      set({ aiConfig: config, backendConnected: true });
    } catch (err: any) {
      set({ errorMessage: err.message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
