import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '@omnistay/database';
import { TotpService, CryptoService } from '@omnistay/security';
import { SmsService } from '../src/domains/auth/services/sms.service.js';
import { RedisService } from '@omnistay/infrastructure';
import { HttpExceptionFilter } from '@omnistay/backend-common';
import bcrypt from 'bcryptjs';

describe('Project Titan — 10 Personas / Roles RBAC & Auth Audit (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let totpService: TotpService;
  let cryptoService: CryptoService;
  let smsService: SmsService;
  let redisService: RedisService;

  let orgAlpha: any;
  let orgBeta: any;

  // The 10 Persona Definitions from Sakib_Project_Plan.pdf (Section 1.4 & Section 19.4)
  const personaDefinitions = [
    {
      roleName: 'Platform SuperAdmin',
      email: 'audit.superadmin@omnistay.com',
      permissions: ['system:root', 'tenant:manage', 'tenant:audit', 'tenant:create'],
      isMandatory2fa: true,
      testEndpoint: '/api/v1/admin/superadmin-only',
    },
    {
      roleName: 'Company Owner / GM',
      email: 'audit.owner.gm@omnistay.com',
      permissions: [
        'properties:manage',
        'rooms:manage',
        'rates:manage',
        'reservations:manage',
        'staff:manage',
        'finance:read',
        'reports:view',
      ],
      isMandatory2fa: true,
      testEndpoint: '/api/v1/owner/property-settings',
    },
    {
      roleName: 'Chief Financial Officer / Accountant',
      email: 'audit.cfo.accountant@omnistay.com',
      permissions: ['finance:read', 'finance:write', 'reports:view', 'audit:export'],
      isMandatory2fa: true,
      testEndpoint: '/api/v1/finance/reports',
    },
    {
      roleName: 'Front Desk Agent',
      email: 'audit.frontdesk@omnistay.com',
      permissions: ['reservations:read', 'reservations:write', 'rooms:read', 'folios:manage'],
      isMandatory2fa: false,
      testEndpoint: '/api/v1/frontdesk/checkin',
    },
    {
      roleName: 'Housekeeping Supervisor',
      email: 'audit.housekeeping@omnistay.com',
      permissions: ['rooms:read', 'housekeeping:manage', 'housekeeping:update'],
      isMandatory2fa: false,
      testEndpoint: '/api/v1/housekeeping/tasks',
    },
    {
      roleName: 'F&B / POS Cashier',
      email: 'audit.pos.cashier@omnistay.com',
      permissions: ['pos:terminal', 'pos:orders', 'pos:charge'],
      isMandatory2fa: false,
      testEndpoint: '/api/v1/pos/terminal',
    },
    {
      roleName: 'HR & Payroll Director',
      email: 'audit.hr.director@omnistay.com',
      permissions: ['staff:manage', 'hrm:payroll', 'hrm:shifts'],
      isMandatory2fa: false,
      testEndpoint: '/api/v1/hrm/payroll',
    },
    {
      roleName: 'Third-Party Vendor / Host',
      email: 'audit.vendor@omnistay.com',
      permissions: ['marketplace:vendor', 'marketplace:listings', 'marketplace:payouts'],
      isMandatory2fa: false,
      testEndpoint: '/api/v1/vendor/listings',
    },
    {
      roleName: 'Maintenance Engineer',
      email: 'audit.maintenance@omnistay.com',
      permissions: ['maintenance:read', 'maintenance:tickets', 'rooms:out_of_order'],
      isMandatory2fa: false,
      testEndpoint: '/api/v1/maintenance/tickets',
    },
    {
      roleName: 'Hotel Guest (Traveler)',
      email: 'audit.guest@omnistay.com',
      permissions: ['guest:bookings', 'guest:profile', 'marketplace:browse'],
      isMandatory2fa: false,
      testEndpoint: '/api/v1/guest/portal',
    },
  ];

  // Map to hold generated tokens and secrets for all 10 roles
  const roleContexts = new Map<
    string,
    {
      user: any;
      role: any;
      plainTotpSecret?: string;
      accessToken?: string;
      refreshToken?: string;
      tempToken?: string;
    }
  >();

  let orgBetaUser: any;
  let orgBetaToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
    totpService = app.get(TotpService);
    cryptoService = app.get(CryptoService);
    smsService = app.get(SmsService);
    redisService = app.get(RedisService);

    const testPasswordHash = await bcrypt.hash('AuditSecure2026!', 10);

    // 1. Non-destructively upsert Tenant Organizations
    orgAlpha = await prisma.organization.upsert({
      where: { slug: 'titan-audit-alpha' },
      update: {},
      create: { name: 'Titan Audit Org Alpha', slug: 'titan-audit-alpha' },
    });

    orgBeta = await prisma.organization.upsert({
      where: { slug: 'titan-audit-beta' },
      update: {},
      create: { name: 'Titan Audit Org Beta', slug: 'titan-audit-beta' },
    });

    // 2. Non-destructively upsert all 10 Roles and Users in Org Alpha
    for (const def of personaDefinitions) {
      const role = await prisma.role.upsert({
        where: {
          organizationId_name: { organizationId: orgAlpha.id, name: def.roleName },
        },
        update: { permissions: def.permissions },
        create: {
          organizationId: orgAlpha.id,
          name: def.roleName,
          permissions: def.permissions,
        },
      });

      let plainTotpSecret: string | undefined;
      let encryptedSecret: string | undefined;

      if (def.isMandatory2fa) {
        plainTotpSecret = totpService.generateSecret();
        encryptedSecret = cryptoService.encrypt(plainTotpSecret);
      }

      const user = await prisma.user.upsert({
        where: { email: def.email },
        update: {
          passwordHash: testPasswordHash,
          status: 'ACTIVE',
          ...(encryptedSecret ? { twoFactorSecret: encryptedSecret, isTwoFactorEnabled: true } : {}),
        },
        create: {
          email: def.email,
          name: def.roleName,
          passwordHash: testPasswordHash,
          status: 'ACTIVE',
          isTwoFactorEnabled: !!encryptedSecret,
          twoFactorSecret: encryptedSecret,
        },
      });

      await prisma.membership.upsert({
        where: {
          organizationId_userId: { organizationId: orgAlpha.id, userId: user.id },
        },
        update: { roleId: role.id },
        create: {
          organizationId: orgAlpha.id,
          userId: user.id,
          roleId: role.id,
        },
      });

      roleContexts.set(def.roleName, {
        user,
        role,
        plainTotpSecret,
      });
    }

    // 3. Upsert a separate user in Org Beta for cross-tenant tests
    const betaRole = await prisma.role.upsert({
      where: {
        organizationId_name: { organizationId: orgBeta.id, name: 'Front Desk Agent' },
      },
      update: {},
      create: {
        organizationId: orgBeta.id,
        name: 'Front Desk Agent',
        permissions: ['reservations:read', 'rooms:read'],
      },
    });

    orgBetaUser = await prisma.user.upsert({
      where: { email: 'audit.beta.agent@omnistay.com' },
      update: { passwordHash: testPasswordHash, status: 'ACTIVE' },
      create: {
        email: 'audit.beta.agent@omnistay.com',
        name: 'Beta Front Desk Agent',
        passwordHash: testPasswordHash,
        status: 'ACTIVE',
      },
    });

    await prisma.membership.upsert({
      where: {
        organizationId_userId: { organizationId: orgBeta.id, userId: orgBetaUser.id },
      },
      update: { roleId: betaRole.id },
      create: {
        organizationId: orgBeta.id,
        userId: orgBetaUser.id,
        roleId: betaRole.id,
      },
    });

    const betaLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'audit.beta.agent@omnistay.com', password: 'AuditSecure2026!' });
    orgBetaToken = betaLoginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Task 1 & 2: Personas & Database Role-Permission Mapping', () => {
    it('should confirm all 10 roles exist in database with correct permissions', async () => {
      const dbRoles = await prisma.role.findMany({
        where: { organizationId: orgAlpha.id },
        select: { name: true, permissions: true },
      });

      expect(dbRoles.length).toBeGreaterThanOrEqual(10);

      for (const def of personaDefinitions) {
        const found = dbRoles.find((r) => r.name === def.roleName);
        expect(found).toBeDefined();
        for (const perm of def.permissions) {
          expect(found!.permissions).toContain(perm);
        }
      }
    });
  });

  describe('Task 3: Authentication & 2FA Enforcement across all 10 roles', () => {
    it('should challenge Mandatory 2FA roles (SuperAdmin, Owner/GM, CFO) and withhold tokens', async () => {
      const mandatoryRoles = personaDefinitions.filter((d) => d.isMandatory2fa);

      for (const def of mandatoryRoles) {
        const res = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({ email: def.email, password: 'AuditSecure2026!' })
          .expect(200);

        expect(res.body.requires2fa).toBe(true);
        expect(res.body.tempToken).toBeDefined();
        expect(res.body.accessToken).toBeUndefined();
        expect(res.body.refreshToken).toBeUndefined();

        const ctx = roleContexts.get(def.roleName)!;
        ctx.tempToken = res.body.tempToken;

        // Challenge token must NOT be usable on protected routes
        await request(app.getHttpServer())
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${res.body.tempToken}`)
          .expect(401);

        // Unlock full session with valid TOTP code
        const code = totpService.generateToken(ctx.plainTotpSecret!);
        const verifyRes = await request(app.getHttpServer())
          .post('/api/v1/auth/2fa/verify')
          .send({ tempToken: ctx.tempToken, code })
          .expect(200);

        expect(verifyRes.body.accessToken).toBeDefined();
        expect(verifyRes.body.refreshToken).toBeDefined();
        expect(verifyRes.body.role).toBe(def.roleName);

        ctx.accessToken = verifyRes.body.accessToken;
        ctx.refreshToken = verifyRes.body.refreshToken;

        // Disabling 2FA must be strictly forbidden for mandatory roles
        await request(app.getHttpServer())
          .post('/api/v1/auth/2fa/disable')
          .set('Authorization', `Bearer ${ctx.accessToken}`)
          .send({ password: 'AuditSecure2026!', code })
          .expect(403);
      }
    });

    it('should allow Direct Login for non-mandatory roles (Roles 4-10)', async () => {
      const nonMandatoryRoles = personaDefinitions.filter((d) => !d.isMandatory2fa);

      for (const def of nonMandatoryRoles) {
        const res = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({ email: def.email, password: 'AuditSecure2026!' })
          .expect(200);

        expect(res.body.requires2fa).toBeUndefined();
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
        expect(res.body.role).toBe(def.roleName);

        const ctx = roleContexts.get(def.roleName)!;
        ctx.accessToken = res.body.accessToken;
        ctx.refreshToken = res.body.refreshToken;
      }
    });

    it('should allow optional 2FA setup and teardown for non-mandatory roles', async () => {
      const frontDeskCtx = roleContexts.get('Front Desk Agent')!;

      // 1. Setup 2FA
      const setupRes = await request(app.getHttpServer())
        .post('/api/v1/auth/2fa/setup')
        .set('Authorization', `Bearer ${frontDeskCtx.accessToken}`)
        .expect(200);

      expect(setupRes.body.secret).toBeDefined();
      expect(setupRes.body.recoveryCodes).toBeDefined();

      // 2. Confirm 2FA
      const code = totpService.generateToken(setupRes.body.secret);
      await request(app.getHttpServer())
        .post('/api/v1/auth/2fa/confirm')
        .set('Authorization', `Bearer ${frontDeskCtx.accessToken}`)
        .send({ code })
        .expect(200);

      // 3. Disable 2FA with password and code (allowed for non-mandatory roles)
      const disableCode = totpService.generateToken(setupRes.body.secret);
      await request(app.getHttpServer())
        .post('/api/v1/auth/2fa/disable')
        .set('Authorization', `Bearer ${frontDeskCtx.accessToken}`)
        .send({ password: 'AuditSecure2026!', code: disableCode })
        .expect(200);
    });
  });

  describe('Task 4 & 5: RolesGuard Allowed and Denied Access for Every Role', () => {
    it('should allow each role to access its designated domain endpoint', async () => {
      for (const def of personaDefinitions) {
        const ctx = roleContexts.get(def.roleName)!;
        const res = await request(app.getHttpServer())
          .get(def.testEndpoint)
          .set('Authorization', `Bearer ${ctx.accessToken}`)
          .expect(200);

        expect(res.body.status).toBe('success');
      }
    });

    it('should deny access (403 Forbidden) when a role accesses an unauthorized endpoint', async () => {
      const deniedCombinations = [
        { role: 'Front Desk Agent', endpoint: '/api/v1/admin/superadmin-only' },
        { role: 'Front Desk Agent', endpoint: '/api/v1/finance/reports' },
        { role: 'Housekeeping Supervisor', endpoint: '/api/v1/pos/terminal' },
        { role: 'Housekeeping Supervisor', endpoint: '/api/v1/hrm/payroll' },
        { role: 'F&B / POS Cashier', endpoint: '/api/v1/maintenance/tickets' },
        { role: 'HR & Payroll Director', endpoint: '/api/v1/vendor/listings' },
        { role: 'Third-Party Vendor / Host', endpoint: '/api/v1/admin/superadmin-only' },
        { role: 'Maintenance Engineer', endpoint: '/api/v1/finance/reports' },
        { role: 'Hotel Guest (Traveler)', endpoint: '/api/v1/owner/property-settings' },
        { role: 'Hotel Guest (Traveler)', endpoint: '/api/v1/admin/superadmin-only' },
      ];

      for (const comb of deniedCombinations) {
        const ctx = roleContexts.get(comb.role)!;
        await request(app.getHttpServer())
          .get(comb.endpoint)
          .set('Authorization', `Bearer ${ctx.accessToken}`)
          .expect(403);
      }
    });
  });

  describe('Task 6: PermissionsGuard Enforcement', () => {
    it('should allow access when user has required permission (audit:export)', async () => {
      // CFO / Accountant has 'audit:export'
      const cfoCtx = roleContexts.get('Chief Financial Officer / Accountant')!;
      const res = await request(app.getHttpServer())
        .get('/api/v1/audit/export')
        .set('Authorization', `Bearer ${cfoCtx.accessToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Audit export access granted');
    });

    it('should deny access (403) when user lacks required permission', async () => {
      // Front Desk Agent lacks 'audit:export'
      const frontDeskCtx = roleContexts.get('Front Desk Agent')!;
      const res = await request(app.getHttpServer())
        .get('/api/v1/audit/export')
        .set('Authorization', `Bearer ${frontDeskCtx.accessToken}`)
        .expect(403);

      expect(res.body.message).toContain('Missing required permissions');
    });

    it('should enforce rooms:out_of_order permission on maintenance room clearing', async () => {
      // Maintenance Engineer has 'rooms:out_of_order'
      const maintCtx = roleContexts.get('Maintenance Engineer')!;
      await request(app.getHttpServer())
        .get('/api/v1/maintenance/clear-room')
        .set('Authorization', `Bearer ${maintCtx.accessToken}`)
        .expect(200);

      // Guest lacks 'rooms:out_of_order'
      const guestCtx = roleContexts.get('Hotel Guest (Traveler)')!;
      await request(app.getHttpServer())
        .get('/api/v1/maintenance/clear-room')
        .set('Authorization', `Bearer ${guestCtx.accessToken}`)
        .expect(403);
    });
  });

  describe('Task 4 & 5 (Tenant Isolation): TenantGuard and Cross-Tenant Denial', () => {
    it('should deny cross-tenant access when Org Alpha user accesses Org Beta resource (403)', async () => {
      const frontDeskCtx = roleContexts.get('Front Desk Agent')!;
      await request(app.getHttpServer())
        .get(`/api/v1/tenants/${orgBeta.id}/resource`)
        .set('Authorization', `Bearer ${frontDeskCtx.accessToken}`)
        .expect(403);
    });

    it('should deny cross-tenant organization profile access via OrganizationController (403)', async () => {
      const frontDeskCtx = roleContexts.get('Front Desk Agent')!;
      await request(app.getHttpServer())
        .get(`/api/v1/organizations/${orgBeta.id}`)
        .set('Authorization', `Bearer ${frontDeskCtx.accessToken}`)
        .expect(403);
    });

    it('should allow user to access their own organization resource (200)', async () => {
      const frontDeskCtx = roleContexts.get('Front Desk Agent')!;
      const res = await request(app.getHttpServer())
        .get(`/api/v1/tenants/${orgAlpha.id}/resource`)
        .set('Authorization', `Bearer ${frontDeskCtx.accessToken}`)
        .expect(200);

      expect(res.body.organizationId).toBe(orgAlpha.id);
      expect(res.body.userOrgId).toBe(orgAlpha.id);
    });

    it('should allow SuperAdmin cross-tenant access with system admin permissions', async () => {
      const superAdminCtx = roleContexts.get('Platform SuperAdmin')!;
      // SuperAdmin can access Org Beta resource
      const res = await request(app.getHttpServer())
        .get(`/api/v1/tenants/${orgBeta.id}/resource`)
        .set('Authorization', `Bearer ${superAdminCtx.accessToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');

      // SuperAdmin can view Org Beta details
      const orgRes = await request(app.getHttpServer())
        .get(`/api/v1/organizations/${orgBeta.id}`)
        .set('Authorization', `Bearer ${superAdminCtx.accessToken}`)
        .expect(200);

      expect(orgRes.body.slug).toBe('titan-audit-beta');
    });

    it('should block Org Beta user attempting to access Org Alpha resource', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/tenants/${orgAlpha.id}/resource`)
        .set('Authorization', `Bearer ${orgBetaToken}`)
        .expect(403);
    });
  });

  describe('Task 3: Refresh Token Rotation & Family Reuse Detection', () => {
    it('should rotate refresh token and revoke token family on replay', async () => {
      const frontDeskCtx = roleContexts.get('Front Desk Agent')!;
      const oldRefreshToken = frontDeskCtx.refreshToken!;

      // 1. Rotate token
      const rotateRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: oldRefreshToken })
        .expect(200);

      expect(rotateRes.body.accessToken).toBeDefined();
      expect(rotateRes.body.refreshToken).toBeDefined();
      expect(rotateRes.body.refreshToken).not.toBe(oldRefreshToken);

      const newRefreshToken = rotateRes.body.refreshToken;

      // 2. Replay the old refresh token (detected as replay)
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: oldRefreshToken })
        .expect(401);

      // 3. Family revocation check: the new token should now also be invalidated
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: newRefreshToken })
        .expect(401);
    });

    it('should support explicit logout and revoke token family', async () => {
      // Login fresh session
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'audit.frontdesk@omnistay.com', password: 'AuditSecure2026!' })
        .expect(200);

      const { refreshToken } = loginRes.body;

      // Logout
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(200);

      // Subsequent refresh must fail
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('Task 7: Redis-Backed TOTP Replay Protection', () => {
    it('should prevent reusing the same TOTP code within valid window (HMAC + Redis SET NX)', async () => {
      // Use dedicated user with fresh secret to ensure test isolation from earlier test cases
      const replaySecret = totpService.generateSecret();
      const encryptedSecret = cryptoService.encrypt(replaySecret);
      const replayUser = await prisma.user.upsert({
        where: { email: 'audit.replay.user@omnistay.com' },
        update: { twoFactorSecret: encryptedSecret, isTwoFactorEnabled: true },
        create: {
          email: 'audit.replay.user@omnistay.com',
          name: 'Audit Replay User',
          passwordHash: await bcrypt.hash('AuditSecure2026!', 10),
          status: 'ACTIVE',
          isTwoFactorEnabled: true,
          twoFactorSecret: encryptedSecret,
        },
      });

      const role = await prisma.role.findFirst({
        where: { organizationId: orgAlpha.id, name: 'Company Owner / GM' },
      });

      await prisma.membership.upsert({
        where: {
          organizationId_userId: { organizationId: orgAlpha.id, userId: replayUser.id },
        },
        update: { roleId: role!.id },
        create: {
          organizationId: orgAlpha.id,
          userId: replayUser.id,
          roleId: role!.id,
        },
      });

      // Login to get fresh challenge tempToken
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'audit.replay.user@omnistay.com', password: 'AuditSecure2026!' })
        .expect(200);

      const tempToken1 = loginRes.body.tempToken;
      const code = totpService.generateToken(replaySecret);

      // Consume OTP 1st time -> Success
      const firstRes = await request(app.getHttpServer())
        .post('/api/v1/auth/2fa/verify')
        .send({ tempToken: tempToken1, code })
        .expect(200);

      expect(firstRes.body.accessToken).toBeDefined();

      // Login again to get a second valid tempToken
      const loginRes2 = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'audit.replay.user@omnistay.com', password: 'AuditSecure2026!' })
        .expect(200);

      const tempToken2 = loginRes2.body.tempToken;

      // Replay the SAME OTP code with second tempToken -> Must be rejected with 401
      const replayRes = await request(app.getHttpServer())
        .post('/api/v1/auth/2fa/verify')
        .send({ tempToken: tempToken2, code })
        .expect(401);

      expect(replayRes.body.message).toContain('TOTP code has already been consumed');
    });
  });

  describe('Task 8: Password Reset Anti-Enumeration & Atomicity', () => {
    it('should return identical response for existing and nonexistent emails (anti-enumeration)', async () => {
      const existingRes = await request(app.getHttpServer())
        .post('/api/v1/auth/password-reset/request')
        .send({ email: 'audit.frontdesk@omnistay.com' })
        .expect(200);

      const nonExistentRes = await request(app.getHttpServer())
        .post('/api/v1/auth/password-reset/request')
        .send({ email: 'ghost.user.random999@omnistay.com' })
        .expect(200);

      expect(existingRes.body.message).toBe(nonExistentRes.body.message);
      expect(existingRes.body.message).toContain(
        'If an account exists with that email address, a password reset link has been sent.',
      );
    });

    it('should reject invalid or expired reset token with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/password-reset/confirm')
        .send({ token: 'invalid_hex_token_1234567890abcdef', newPassword: 'NewPassword2026!' })
        .expect(400);
    });
  });

  describe('Task 9: SMS OTP Provider Audit & Operational Status', () => {
    it('should verify whether SMS provider is configured and operational', async () => {
      const isOperational = smsService.isOperational();
      // Since Twilio credentials are not provided in environment, SMS is not operational
      expect(typeof isOperational).toBe('boolean');
      expect(isOperational).toBe(false);

      // Attempting to send OTP returns false and logs warning fallback
      const sent = await smsService.sendOtp('+8801700000000', '123456');
      expect(sent).toBe(false);
    });
  });
});
