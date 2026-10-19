import process from 'node:process';

/**
 * Strongly-typed environment configuration getter and validator
 */

export interface AppEnvConfig {
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiration: string;
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  allowedOrigins: string[];
  encryptionKey: string;
}

export function getAppEnvConfig(): AppEnvConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const port = parseInt(process.env.PORT || '4000', 10);
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

  const allowedOriginsStr = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001';
  const allowedOrigins = allowedOriginsStr.split(',').map((o: string) => o.trim());

  return {
    databaseUrl:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/omnistay_dev?schema=public',
    jwtSecret: process.env.JWT_SECRET || 'omnistay_enterprise_super_secret_jwt_key_2026',
    jwtExpiration: process.env.JWT_EXPIRATION || '7d',
    redisHost: process.env.REDIS_HOST || '127.0.0.1',
    redisPort: isNaN(redisPort) ? 6379 : redisPort,
    redisPassword: process.env.REDIS_PASSWORD || undefined,
    port: isNaN(port) ? 4000 : port,
    nodeEnv,
    allowedOrigins,
    encryptionKey:
      process.env.ENCRYPTION_KEY ||
      process.env.JWT_SECRET ||
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  };
}
