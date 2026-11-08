import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SaasBillingService, CANONICAL_SAAS_PLANS } from './application/services/saas-billing.service.js';
import { ComplianceService } from './application/services/compliance.service.js';

describe('Chapter 19: Multi-Tenant SaaS Architecture, Commercial Billing & Compliance', () => {
  let mockPrisma: any;
  let saasService: SaasBillingService;
  let complianceService: ComplianceService;

  const mockPlans: any[] = [];
  const mockOrders: any[] = [];
  const mockRequests: any[] = [];
  const mockSettings: any[] = [];
  const mockConsents: any[] = [];
  const mockUsers: any[] = [
    {
      id: 'usr-101',
      name: 'John Doe',
      email: 'john.doe@guest.com',
      phone: '+1-555-0199',
      avatar: 'https://cdn.omnistay.com/avatars/john.jpg',
      status: 'ACTIVE',
      isSuperadmin: false,
      isTwoFactorEnabled: true,
      tenantId: 'org-1',
      bookings: [
        { id: 'bk-1', orderNumber: 'ORD-9901', checkIn: new Date(), checkOut: new Date(), totalPrice: 700, status: 'CONFIRMED' },
      ],
      invoices: [{ id: 'inv-1', invoiceNumber: 'INV-1001', amount: 700, status: 'PAID' }],
      userVerifications: [{ id: 'uv-1', idType: 'PASSPORT', status: 'VERIFIED' }],
    },
  ];
  const mockOrgs: any[] = [
    { id: 'org-1', name: 'Grand Palace', slug: 'grand-palace', planId: null, status: 'active', deletedAt: null },
  ];

  beforeEach(() => {
    mockPlans.length = 0;
    mockOrders.length = 0;
    mockRequests.length = 0;
    mockSettings.length = 0;
    mockConsents.length = 0;

    mockPrisma = {
      saasPlan: {
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockPlans)),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.code) return Promise.resolve(mockPlans.find((p) => p.code === where.code) || null);
          if (where.id) return Promise.resolve(mockPlans.find((p) => p.id === where.id) || null);
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const plan = { id: `plan-${mockPlans.length + 1}`, ...data };
          mockPlans.push(plan);
          return Promise.resolve(plan);
        }),
      },
      organization: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(mockOrgs.find((o) => o.id === where.id) || null);
        }),
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockOrgs)),
        groupBy: vi.fn().mockResolvedValue([{ planId: 'plan-1', _count: { id: 1 } }]),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const org = mockOrgs.find((o) => o.id === where.id);
          if (org) Object.assign(org, data);
          return Promise.resolve(org);
        }),
        count: vi.fn().mockResolvedValue(12),
      },
      subscriptionOrder: {
        count: vi.fn().mockImplementation(() => Promise.resolve(mockOrders.length)),
        create: vi.fn().mockImplementation(({ data }) => {
          const order = { id: `order-${mockOrders.length + 1}`, ...data };
          mockOrders.push(order);
          return Promise.resolve(order);
        }),
        findMany: vi.fn().mockImplementation(() =>
          Promise.resolve(
            mockOrders.map((o) => ({
              ...o,
              plan: mockPlans.find((p) => p.id === o.planId) || null,
            }))
          )
        ),
      },
      planRequest: {
        create: vi.fn().mockImplementation(({ data }) => {
          const req = { id: `req-${mockRequests.length + 1}`, ...data };
          mockRequests.push(req);
          return Promise.resolve(req);
        }),
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockRequests)),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          const req = mockRequests.find((r) => r.id === where.id);
          if (!req) return Promise.resolve(null);
          const plan = mockPlans.find((p) => p.id === req.planId);
          return Promise.resolve({ ...req, plan });
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const req = mockRequests.find((r) => r.id === where.id);
          if (req) Object.assign(req, data);
          return Promise.resolve(req);
        }),
      },
      systemSetting: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(mockSettings.find((s) => s.key === where.key) || null);
        }),
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockSettings)),
        create: vi.fn().mockImplementation(({ data }) => {
          mockSettings.push(data);
          return Promise.resolve(data);
        }),
        upsert: vi.fn().mockImplementation(({ where, create, update }) => {
          let s = mockSettings.find((item) => item.key === where.key);
          if (s) {
            Object.assign(s, update);
          } else {
            s = { ...create };
            mockSettings.push(s);
          }
          return Promise.resolve(s);
        }),
      },
      cookieConsent: {
        create: vi.fn().mockImplementation(({ data }) => {
          const c = { id: `cc-${mockConsents.length + 1}`, ...data, consentedAt: new Date() };
          mockConsents.push(c);
          return Promise.resolve(c);
        }),
        findFirst: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(mockConsents.find((c) => c.visitorIp === where.visitorIp) || null);
        }),
      },
      user: {
        count: vi.fn().mockResolvedValue(148),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(mockUsers.find((u) => u.id === where.id) || null);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const u = mockUsers.find((user) => user.id === where.id);
          if (u) Object.assign(u, data);
          return Promise.resolve(u);
        }),
      },
      userVerification: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      activityLog: {
        create: vi.fn().mockResolvedValue({ id: 'log-1' }),
      },
      hotel: {
        count: vi.fn().mockResolvedValue(15),
      },
      room: {
        count: vi.fn().mockResolvedValue(85),
      },
      roomType: {
        count: vi.fn().mockResolvedValue(85),
      },
      booking: {
        aggregate: vi.fn().mockResolvedValue({ _sum: { totalAmount: 450000.0 } }),
      },
      $transaction: vi.fn().mockImplementation(async (arg) => {
        if (Array.isArray(arg)) {
          return Promise.all(arg);
        }
        if (typeof arg === 'function') {
          return arg(mockPrisma);
        }
        return arg;
      }),
    };

    saasService = new SaasBillingService(mockPrisma);
    complianceService = new ComplianceService(mockPrisma);
  });

  it('19.2: should seed and list canonical SaaS subscription tiers (Starter, Professional, Enterprise)', async () => {
    await saasService.ensureSeedPlans();
    expect(mockPlans.length).toBe(3);
    expect(mockPlans.map((p) => p.code)).toEqual(['starter', 'professional', 'enterprise']);
    expect(mockPlans.find((p) => p.code === 'starter')?.monthlyPrice).toBe(49.0);
    expect(mockPlans.find((p) => p.code === 'professional')?.monthlyPrice).toBe(149.0);
    expect(mockPlans.find((p) => p.code === 'enterprise')?.monthlyPrice).toBe(399.0);

    const retrieved = await saasService.getPlans();
    expect(retrieved.length).toBe(3);
  });

  it('19.2: should subscribe tenant organization to Professional tier and set quota expiration', async () => {
    await saasService.ensureSeedPlans();
    const result = await saasService.subscribeTenant('org-1', {
      planCode: 'professional',
      billingCycle: 'annual',
      paymentMethod: 'stripe',
    });

    expect(result.success).toBe(true);
    expect(result.planCode).toBe('professional');
    expect(result.billingCycle).toBe('annual');
    expect(result.order.amount).toBe(1490.0);
    expect(mockOrgs[0].planId).toBeDefined();
  });

  it('19.3: should calculate SuperAdmin health telemetry and macro revenue metrics (MRR, ARR, GMV)', async () => {
    await saasService.ensureSeedPlans();
    const telemetry = await saasService.getHealthTelemetry();
    expect(telemetry.totalTenants).toBe(12);
    expect(telemetry.totalUsers).toBe(148);
    expect(telemetry.totalRoomsManaged).toBe(85);
    expect(telemetry.databaseHealth).toBe('OPTIMAL');

    const revenue = await saasService.getRevenueMetrics();
    expect(revenue.monthlyRecurringRevenue).toBeGreaterThan(0);
    expect(revenue.annualRecurringRevenue).toBe(revenue.monthlyRecurringRevenue * 12);
    expect(revenue.totalGrossMerchandiseValue).toBe(450000.0);
    expect(revenue.churnRatePercent).toBe(1.8);
  });

  it('19.3: should toggle global feature flags (e.g. AI Concierge, Crypto Payments)', async () => {
    await saasService.ensureDefaultFeatureFlags();
    const flags = await saasService.getFeatureFlags();
    expect(flags.some((f) => f.flagKey === 'ai_concierge')).toBe(true);

    const toggled = await saasService.toggleFeatureFlag({
      flagKey: 'crypto_payments',
      enabled: false,
    });
    expect(toggled.enabled).toBe(false);
  });

  it('19.5: should record visitor cookie consent preferences', async () => {
    const consent = await complianceService.recordCookieConsent('192.168.1.50', {
      consentTypes: ['necessary', 'analytics'],
      userAgent: 'Mozilla/5.0 Test Suite',
    });
    expect(consent.visitorIp).toBe('192.168.1.50');
    expect(consent.consentTypes).toEqual(['necessary', 'analytics']);

    const retrieved = await complianceService.getCookieConsent('192.168.1.50');
    expect(retrieved.visitorIp).toBe('192.168.1.50');
  });

  it('19.5: should execute Right-to-be-Forgotten data anonymization per GDPR Article 17', async () => {
    const res = await complianceService.anonymizeUserData('usr-101', 'admin-caller');
    expect(res.success).toBe(true);
    expect(res.status).toBe('ANONYMIZED');
    expect(res.anonymizedEmail).toContain('@gdpr.omnistay.com');

    const user = mockUsers.find((u) => u.id === 'usr-101');
    expect(user.phone).toBeNull();
    expect(user.avatar).toBeNull();
    expect(user.isTwoFactorEnabled).toBe(false);
  });

  it('19.5: should generate guest data portability package per GDPR Article 20', async () => {
    const dataPkg = await complianceService.exportUserData('usr-101');
    expect(dataPkg.exportMetadata.standard).toContain('GDPR Article 20');
    expect(dataPkg.personalData.id).toBe('usr-101');
    expect(dataPkg.hospitalityActivity.bookings).toHaveLength(1);
    expect(dataPkg.hospitalityActivity.invoices).toHaveLength(1);
  });
});

