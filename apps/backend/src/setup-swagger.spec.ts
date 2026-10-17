import { describe, it, expect, vi } from 'vitest';
import { setupSwagger, createOpenApiConfig } from './setup-swagger.js';
import { SwaggerModule } from '@nestjs/swagger';

describe('OpenAPI 3.1.0 Specification Setup', () => {
  it('should generate an OpenAPI 3.1 document configuration with required security schemes', () => {
    const config = createOpenApiConfig();

    expect(config.info.title).toBe('Softsasi OmniStay 360 Enterprise Suite API');
    expect(config.info.version).toBe('1.0.0');

    // Verify Bearer JWT Security Scheme
    const components = (config as any).components;
    expect(components).toBeDefined();
    expect(components.securitySchemes['JWT-Auth']).toBeDefined();
    expect(components.securitySchemes['JWT-Auth'].type).toBe('http');
    expect(components.securitySchemes['JWT-Auth'].scheme).toBe('bearer');
    expect(components.securitySchemes['JWT-Auth'].bearerFormat).toBe('JWT');

    // Verify Tenant Header Security Scheme
    expect(components.securitySchemes['Tenant-Header']).toBeDefined();
    expect(components.securitySchemes['Tenant-Header'].type).toBe('apiKey');
    expect(components.securitySchemes['Tenant-Header'].in).toBe('header');
    expect(components.securitySchemes['Tenant-Header'].name).toBe('x-tenant-id');
  });

  it('should enforce openapi version 3.1.0 and 2020-12 dialect on created document', () => {
    const mockApp: any = {
      getHttpAdapter: vi.fn().mockReturnValue({
        getType: () => 'express',
      }),
    };

    const mockDocument: any = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const createDocSpy = vi.spyOn(SwaggerModule, 'createDocument').mockReturnValue(mockDocument);
    const setupSpy = vi.spyOn(SwaggerModule, 'setup').mockImplementation(() => {});

    const document = setupSwagger(mockApp);

    expect(document.openapi).toBe('3.1.0');
    expect((document as any).jsonSchemaDialect).toBe('https://spec.openapis.org/oas/3.1/dialect/base');

    createDocSpy.mockRestore();
    setupSpy.mockRestore();
  });

  describe('OpenAPI 3.1 Live Document & Schema Validation', () => {
    let document: any;
    let app: any;

    beforeAll(async () => {
      const { AppModule } = await import('./app.module.js');
      const { Test } = await import('@nestjs/testing');
      const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      document = setupSwagger(app);
    });

    afterAll(async () => {
      if (app) {
        await app.close();
      }
    });

    it('should declare OpenAPI 3.1.0 version and JSON Schema 2020-12 dialect', () => {
      expect(document.openapi).toBe('3.1.0');
      expect(document.jsonSchemaDialect).toBe('https://spec.openapis.org/oas/3.1/dialect/base');
      expect(document.info.title).toBe('Softsasi OmniStay 360 Enterprise Suite API');
      expect(document.info.version).toBe('1.0.0');
    });

    it('should define valid OpenAPI 3.1 security schemes', () => {
      const securitySchemes = document.components?.securitySchemes;
      expect(securitySchemes).toBeDefined();

      // JWT Bearer Auth
      expect(securitySchemes['JWT-Auth']).toEqual({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: expect.stringContaining('Bearer access token'),
      });

      // Tenant isolation header
      expect(securitySchemes['Tenant-Header']).toEqual({
        type: 'apiKey',
        name: 'x-tenant-id',
        in: 'header',
        description: expect.stringContaining('Tenant organization UUID'),
      });
    });

    it('should have zero broken or dangling $ref references in the entire specification', () => {
      const brokenRefs: Array<{ path: string; ref: string; missing: string }> = [];

      function checkRefs(node: any, path = '') {
        if (!node || typeof node !== 'object') return;
        if (node.$ref && typeof node.$ref === 'string') {
          const ref = node.$ref;
          if (ref.startsWith('#/components/schemas/')) {
            const schemaName = ref.replace('#/components/schemas/', '');
            if (!document.components?.schemas?.[schemaName]) {
              brokenRefs.push({ path, ref, missing: schemaName });
            }
          } else if (ref.startsWith('#/components/securitySchemes/')) {
            const schemeName = ref.replace('#/components/securitySchemes/', '');
            if (!document.components?.securitySchemes?.[schemeName]) {
              brokenRefs.push({ path, ref, missing: schemeName });
            }
          }
        }
        for (const key of Object.keys(node)) {
          checkRefs(node[key], `${path}.${key}`);
        }
      }

      checkRefs(document);
      expect(brokenRefs).toEqual([]);
    });

    it('should ensure all documented endpoints have valid response definitions and HTTP status codes', () => {
      const paths = document.paths || {};
      const endpointCount = Object.keys(paths).length;
      expect(endpointCount).toBeGreaterThan(0);

      for (const [pathUrl, pathItem] of Object.entries<any>(paths)) {
        for (const [method, op] of Object.entries<any>(pathItem)) {
          if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
            expect(op.responses).toBeDefined();
            const statusCodes = Object.keys(op.responses);
            expect(statusCodes.length).toBeGreaterThan(0);

            // Each response should have a description
            for (const [status, resObj] of Object.entries<any>(op.responses)) {
              expect(resObj.description).toBeDefined();
            }

            // Path parameters must be marked required
            if (op.parameters) {
              for (const param of op.parameters) {
                if (param.in === 'path') {
                  expect(param.required).toBe(true);
                  expect(param.name).toBeDefined();
                  expect(param.schema).toBeDefined();
                }
              }
            }
          }
        }
      }
    });

    it('should validate all component schemas as valid JSON Schema 2020-12 via Ajv 2020', async () => {
      const { createRequire } = await import('node:module');
      const req = createRequire(import.meta.url);
      const Ajv2020 = req('../../../node_modules/.pnpm/ajv@8.20.0/node_modules/ajv/dist/2020.js');
      const ajv = new Ajv2020({ allErrors: true, strict: false });

      const schemas = document.components?.schemas || {};
      expect(Object.keys(schemas).length).toBeGreaterThan(0);

      // Pre-register schemas for cross-referencing
      for (const [name, schema] of Object.entries(schemas)) {
        ajv.addSchema(schema as any, `#/components/schemas/${name}`);
      }

      for (const [name, schema] of Object.entries(schemas)) {
        const isValid = ajv.validateSchema(schema as any);
        expect(isValid, `Schema ${name} is not valid JSON Schema 2020-12`).toBe(true);
      }
    });
  });
});
