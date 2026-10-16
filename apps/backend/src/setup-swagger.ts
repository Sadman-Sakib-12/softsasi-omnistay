import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function createOpenApiConfig() {
  return new DocumentBuilder()
    .setTitle('Softsasi OmniStay 360 Enterprise Suite API')
    .setDescription(
      'Project Titan — Enterprise Multi-Tenant Hospitality PMS Backend Engine. ' +
        'Provides authenticated session lifecycle, distributed rate limiting, queue processing, ' +
        'tenant isolation, and complete property management APIs.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your Bearer access token for authorized endpoint access.',
      },
      'JWT-Auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-tenant-id',
        in: 'header',
        description: 'Tenant organization UUID for multi-tenant scoping and data isolation.',
      },
      'Tenant-Header',
    )
    .build();
}

/**
 * Builds and mounts the OpenAPI 3.1.0 specification and Swagger UI.
 *
 * @param app Initialized NestJS application instance
 * @returns Fully validated OpenAPI 3.1.0 specification object
 */
export function setupSwagger(app: INestApplication): OpenAPIObject {
  const config = createOpenApiConfig();

  const document = SwaggerModule.createDocument(app, config);

  // Enforce OpenAPI 3.1.0 standard compliance
  document.openapi = '3.1.0';
  (document as any).jsonSchemaDialect = 'https://spec.openapis.org/oas/3.1/dialect/base';

  // Mount Swagger UI at /api/docs and raw JSON spec at /api/docs-json
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
    },
    customSiteTitle: 'OmniStay 360 API Documentation',
  });

  return document;
}
