import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/infrastructure/database/prisma.service.js';
import { TotpService } from '../src/domains/auth/services/totp.service.js';
import { CryptoService } from '../src/domains/auth/services/crypto.service.js';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import bcrypt from 'bcryptjs';

describe('OmniStay 360 Architecture & Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let totpService: TotpService;
  let cryptoService: CryptoService;

  let testOrg1: any;
  let testOrg2: any;
  let frontDeskUser: any;
  let ownerUser: any;
  let ownerPlainSecret: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
    totpService = app.get(TotpService);
    cryptoService = app.get(CryptoService);

    // Seed test data in PostgreSQL non-destructively
    testOrg1 = await prisma.organization.upsert({
      where: { slug: 'grand-palace-dhk' },
      update: {},
      create: { name: 'Grand Palace Dhaka', slug: 'grand-palace-dhk' },
    });

    testOrg2 = await prisma.organization.upsert({
      where: { slug: 'sunset-resort-ctg' },
      update: {},
      create: { name: 'Sunset Resort Chittagong', slug: 'sunset-resort-ctg' },
    });

    const frontDeskRole = await prisma.role.upsert({
      where: {
        organizationId_name: { organizationId: testOrg1.id, name: 'Front Desk Agent' },
      },
      update: {},
      create: {
        organizationId: testOrg1.id,
        name: 'Front Desk Agent',
        permissions: ['reservations:read', 'rooms:read'],
      },
    });

    const ownerRole = await prisma.role.upsert({
      where: {
        organizationId_name: { organizationId: testOrg1.id, name: 'Company Owner/GM' },
      },
      update: {},
      create: {
        organizationId: testOrg1.id,
        name: 'Company Owner/GM',
        permissions: ['properties:manage', 'finance:read', 'reports:view', 'rooms:manage'],
      },
    });

    const passwordHash = await bcrypt.hash('Password123!', 10);

    // Front Desk user (no mandatory 2FA)
    frontDeskUser = await prisma.user.upsert({
      where: { email: 'frontdesk.test@omnistay.com' },
      update: {},
      create: {
        email: 'frontdesk.test@omnistay.com',
        name: 'Front Desk Agent',
        passwordHash,
        status: 'ACTIVE',
      },
    });

    await prisma.membership.upsert({
      where: {
        organizationId_userId: { organizationId: testOrg1.id, userId: frontDeskUser.id },
      },
      update: {},
      create: {
        organizationId: testOrg1.id,
        userId: frontDeskUser.id,
        roleId: frontDeskRole.id,
      },
    });

    // Company Owner/GM (mandatory 2FA role)
    ownerPlainSecret = totpService.generateSecret();
    const encryptedSecret = cryptoService.encrypt(ownerPlainSecret);

    ownerUser = await prisma.user.upsert({
      where: { email: 'owner.test@omnistay.com' },
      update: { twoFactorSecret: encryptedSecret, isTwoFactorEnabled: true },
      create: {
        email: 'owner.test@omnistay.com',
        name: 'Company Owner',
        passwordHash,
        status: 'ACTIVE',
        isTwoFactorEnabled: true,
        twoFactorSecret: encryptedSecret,
      },
    });

    await prisma.membership.upsert({
      where: {
        organizationId_userId: { organizationId: testOrg1.id, userId: ownerUser.id },
      },
      update: {},
      create: {
        organizationId: testOrg1.id,
        userId: ownerUser.id,
        roleId: ownerRole.id,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Probes & Correlation Middleware', () => {
    it('GET /health/live should return UP and attach X-Correlation-ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/live')
        .expect(200);

      expect(res.body.status).toBe('UP');
      expect(res.headers['x-correlation-id']).toBeDefined();
    });

    it('GET /health/ready should return connected status for PostgreSQL database', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(res.body.status).toBe('UP');
      expect(res.body.database).toBe('connected');
    });

    it('should propagate client-supplied X-Correlation-ID', async () => {
      const customId = 'test-trace-id-12345';
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', customId)
        .expect(200);

      expect(res.headers['x-correlation-id']).toBe(customId);
    });
  });

  describe('Authentication & Mandatory 2FA Flow', () => {
    let _frontDeskTokens: { accessToken: string; refreshToken: string };
    let ownerTempToken: string;
    let ownerTokens: { accessToken: string; refreshToken: string };

    it('should reject invalid password with generic 401 error', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'frontdesk.test@omnistay.com', password: 'WrongPassword!' })
        .expect(401);

      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should allow direct login with access and refresh tokens for non-2FA user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'frontdesk.test@omnistay.com', password: 'Password123!' })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.requires2fa).toBeUndefined();
      expect(res.body.role).toBe('Front Desk Agent');

      _frontDeskTokens = { accessToken: res.body.accessToken, refreshToken: res.body.refreshToken };
    });

    it('should challenge Company Owner/GM with mandatory 2FA and withhold full tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'owner.test@omnistay.com', password: 'Password123!' })
        .expect(200);

      expect(res.body.requires2fa).toBe(true);
      expect(res.body.tempToken).toBeDefined();
      expect(res.body.accessToken).toBeUndefined();
      expect(res.body.refreshToken).toBeUndefined();

      ownerTempToken = res.body.tempToken;
    });

    it('should reject 2FA temporary token on protected endpoints (purpose restriction)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${ownerTempToken}`)
        .expect(401);
    });

    it('should reject invalid 2FA code with 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/2fa/verify')
        .send({ tempToken: ownerTempToken, code: '000000' })
        .expect(401);
    });

    it('should unlock session and issue full tokens with valid 6-digit TOTP code', async () => {
      const currentCode = totpService.generateToken(ownerPlainSecret);
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/2fa/verify')
        .send({ tempToken: ownerTempToken, code: currentCode })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.role).toBe('Company Owner/GM');

      ownerTokens = { accessToken: res.body.accessToken, refreshToken: res.body.refreshToken };
    });

    it('should allow access to profile with valid access token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${ownerTokens.accessToken}`)
        .expect(200);

      expect(res.body.email).toBe('owner.test@omnistay.com');
    });

    it('should rotate refresh token and revoke the previous token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: ownerTokens.refreshToken })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.refreshToken).not.toBe(ownerTokens.refreshToken);

      // Attempting to reuse the revoked token must fail with 401
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: ownerTokens.refreshToken })
        .expect(401);
    });
  });

  describe('RBAC Roles, Permissions, and Cross-Tenant Denial', () => {
    let frontDeskToken: string;
    let ownerToken: string;

    beforeAll(async () => {
      const fdRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'frontdesk.test@omnistay.com', password: 'Password123!' });
      frontDeskToken = fdRes.body.accessToken;

      const ownerLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'owner.test@omnistay.com', password: 'Password123!' });

      const code = totpService.generateToken(ownerPlainSecret);
      const ownerVerify = await request(app.getHttpServer())
        .post('/api/v1/auth/2fa/verify')
        .send({ tempToken: ownerLogin.body.tempToken, code });
      ownerToken = ownerVerify.body.accessToken;
    });

    it('should allow Company Owner/GM to access financial reports', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/finance/reports')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);
    });

    it('should deny Front Desk Agent access to financial reports (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/finance/reports')
        .set('Authorization', `Bearer ${frontDeskToken}`)
        .expect(403);
    });

    it('should deny non-SuperAdmin access to superadmin-only endpoint (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/superadmin-only')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(403);
    });

    it('should block cross-tenant resource access when client targets another organization', async () => {
      // Front desk user belongs to testOrg1, attempting to access testOrg2
      await request(app.getHttpServer())
        .get(`/api/v1/tenants/${testOrg2.id}/resource`)
        .set('Authorization', `Bearer ${frontDeskToken}`)
        .expect(403);
    });

    it('should allow tenant resource access when targeting own organization', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/tenants/${testOrg1.id}/resource`)
        .set('Authorization', `Bearer ${frontDeskToken}`)
        .expect(200);
    });
  });
});
