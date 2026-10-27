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

  // Enable CORS for Next.js web and admin frontends across all tenant subdomains
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (
        origin.includes('localhost') ||
        origin.includes('omnistay.com') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
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
