import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '@omnistay/database';
import { TotpService, CryptoService } from '@omnistay/security';
import { HttpExceptionFilter } from '@omnistay/backend-common';
import { setupSwagger } from '../src/setup-swagger.js';
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
  let sharedOwnerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    setupSwagger(app);
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
      sharedOwnerToken = res.body.accessToken;
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
      ownerToken = sharedOwnerToken;
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

  describe('OpenAPI 3.1 & Password Reset Endpoints', () => {
    it('should serve Swagger UI at /api/docs', async () => {
      const res = await request(app.getHttpServer()).get('/api/docs/').expect(200);
      expect(res.text).toContain('swagger-ui');
    });

    it('should serve valid OpenAPI 3.1.0 document at /api/docs-json and pass OpenAPI 3.1 validation', async () => {
      const res = await request(app.getHttpServer()).get('/api/docs-json').expect(200);
      const doc = res.body;

      expect(doc.openapi).toBe('3.1.0');
      expect(doc.info.title).toBe('Softsasi OmniStay 360 Enterprise Suite API');
      expect((doc as any).jsonSchemaDialect).toBe('https://spec.openapis.org/oas/3.1/dialect/base');
      expect(doc.components.securitySchemes['JWT-Auth']).toBeDefined();
      expect(doc.paths['/api/v1/auth/password-reset/request']).toBeDefined();
      expect(doc.paths['/api/v1/auth/password-reset/confirm']).toBeDefined();

      // Validate that all schema references resolve
      const brokenRefs: string[] = [];
      function checkRefs(node: any) {
        if (!node || typeof node !== 'object') return;
        if (node.$ref && typeof node.$ref === 'string') {
          if (node.$ref.startsWith('#/components/schemas/')) {
            const schemaName = node.$ref.replace('#/components/schemas/', '');
            if (!doc.components?.schemas?.[schemaName]) brokenRefs.push(node.$ref);
          }
        }
        for (const k of Object.keys(node)) checkRefs(node[k]);
      }
      checkRefs(doc);
      expect(brokenRefs).toEqual([]);

      // Validate component schemas with Ajv2020 (OpenAPI 3.1 uses JSON Schema 2020-12)
      const { createRequire } = await import('node:module');
      const req = createRequire(import.meta.url);
      const Ajv2020 = req('../../../node_modules/.pnpm/ajv@8.20.0/node_modules/ajv/dist/2020.js');
      const ajv = new Ajv2020({ allErrors: true, strict: false });

      for (const [name, schema] of Object.entries(doc.components.schemas || {})) {
        ajv.addSchema(schema as any, `#/components/schemas/${name}`);
      }
      for (const [name, schema] of Object.entries(doc.components.schemas || {})) {
        expect(ajv.validateSchema(schema as any), `Invalid schema: ${name}`).toBe(true);
      }
    });

    it('should accept password reset request for registered user and return generic response', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/password-reset/request')
        .send({ email: 'frontdesk.test@omnistay.com' })
        .expect(200);

      expect(res.body.message).toContain('If an account exists');
    });

    it('should return identical generic message for unknown email to mitigate enumeration', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/password-reset/request')
        .send({ email: 'nonexistent.user.999@omnistay.com' })
        .expect(200);

      expect(res.body.message).toContain('If an account exists');
    });

    it('should reject password reset confirmation with invalid token (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/password-reset/confirm')
        .send({
          token: 'invalid_token_123',
          newPassword: 'BrandNewPassword123!',
        })
        .expect(400);
    });

    it('should reject password reset when new password does not meet complexity requirements', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/password-reset/confirm')
        .send({
          token: 'some_token',
          newPassword: 'simple',
        })
        .expect(400);
    });
  });
});

