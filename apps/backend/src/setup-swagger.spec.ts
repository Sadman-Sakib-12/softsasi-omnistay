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

    vi.spyOn(SwaggerModule, 'createDocument').mockReturnValue(mockDocument);
    vi.spyOn(SwaggerModule, 'setup').mockImplementation(() => {});

    const document = setupSwagger(mockApp);

    expect(document.openapi).toBe('3.1.0');
    expect((document as any).jsonSchemaDialect).toBe('https://spec.openapis.org/oas/3.1/dialect/base');
  });
});
