import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule, ObserveInstrument } from './app.module.js';
import { HttpExceptionFilter } from '@omnistay/backend-common';
import { LoggingInterceptor } from '@omnistay/backend-common';
import { setupSwagger } from './setup-swagger.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Enable CORS for Next.js web and admin frontends
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Global DTO validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global sanitized exception filter (never leaks credentials, secrets, or internal stack traces)
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global logging interceptor (records request duration with correlation ID)
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Mount OpenAPI 3.1.0 specification and Swagger UI
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 4000);
}

await bootstrap();
