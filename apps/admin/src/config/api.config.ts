export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  defaultTenantId: '0646902b-6163-4729-9901-6282ad7236e3', // Grand Palace Dhaka
  endpoints: {
    auth: {
      login: '/api/v1/auth/login',
      me: '/api/v1/auth/me',
      refresh: '/api/v1/auth/refresh',
      verify2fa: '/api/v1/auth/2fa/verify',
    },
    tenants: {
      list: '/api/v1/tenants',
      byId: (id: string) => `/api/v1/tenants/${id}`,
    },
    users: {
      list: '/api/v1/users',
      invite: '/api/v1/users/invite',
      byId: (id: string) => `/api/v1/users/${id}`,
    },
    properties: {
      list: '/api/v1/properties',
      create: '/api/v1/properties',
      byId: (id: string) => `/api/v1/properties/${id}`,
      stats: (id: string) => `/api/v1/properties/${id}/stats`,
    },
    rooms: {
      list: '/api/v1/rooms',
      create: '/api/v1/rooms',
      byId: (id: string) => `/api/v1/rooms/${id}`,
      tapeChart: '/api/v1/rooms/tape-chart',
      checkIn: '/api/v1/rooms/check-in',
      checkOut: '/api/v1/rooms/check-out',
    },
    bookings: {
      list: '/api/v1/bookings',
      create: '/api/v1/bookings',
      byId: (id: string) => `/api/v1/bookings/${id}`,
      cancel: (id: string) => `/api/v1/bookings/${id}/cancel`,
    },
    accounting: {
      runNightAudit: '/api/v1/accounting/night-audit/run',
      nightAuditStatus: '/api/v1/accounting/night-audit/status',
      pnlReport: '/api/v1/accounting/reports/pnl',
      balanceSheet: '/api/v1/accounting/reports/balance-sheet',
      trialBalance: '/api/v1/accounting/reports/trial-balance',
      generalLedger: '/api/v1/accounting/ledger',
    },
    pos: {
      kdsQueue: (outletId: string) => `/api/v1/pos/kds/${outletId}/queue`,
      updateTicketStatus: (ticketId: string) => `/api/v1/pos/kds/tickets/${ticketId}/status`,
      outlets: '/api/v1/pos/outlets',
      orders: '/api/v1/pos/orders',
    },
    housekeeping: {
      tasks: '/api/v1/housekeeping/tasks',
      updateStatus: (id: string) => `/api/v1/housekeeping/tasks/${id}/status`,
    },
    inventory: {
      items: '/api/v1/inventory/items',
      stockLevels: '/api/v1/inventory/stock',
      purchaseOrders: '/api/v1/inventory/purchase-orders',
    },
    hrm: {
      employees: '/api/v1/hrm/employees',
      attendance: '/api/v1/hrm/attendance',
      payroll: '/api/v1/hrm/payroll',
    },
    crm: {
      leads: '/api/v1/crm/leads',
      banquetBookings: '/api/v1/crm/banquets',
    },
    marketplace: {
      channels: '/api/v1/marketplace/channels',
      syncStatus: '/api/v1/marketplace/sync-status',
    },
    ai: {
      conciergeChat: '/api/v1/ai/concierge/chat',
      conciergeConfig: '/api/v1/ai/concierge/config',
      conciergeKnowledge: '/api/v1/ai/concierge/knowledge',
    },
  },
};
