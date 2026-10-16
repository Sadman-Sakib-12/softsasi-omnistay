import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should query PostgreSQL database through PrismaService', async () => {
    const { PrismaService } = await import('@omnistay/database');
    const prisma = app.get(PrismaService);
    const result = await prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 as result`;
    expect(result[0].result).toBe(1);

    const users = await prisma.user.findMany();
    expect(Array.isArray(users)).toBe(true);

    const organizations = await prisma.organization.findMany();
    expect(Array.isArray(organizations)).toBe(true);
  });

  afterEach(async () => {
    await app.close();
  });
});
