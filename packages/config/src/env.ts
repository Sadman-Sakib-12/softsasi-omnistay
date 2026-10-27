import process from 'node:process';

/**
 * Strongly-typed enterprise environment configuration getter and validator
 * Standardized across all Softsasi OmniStay 360 domains (PDF Chapters 1-21)
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
  enableMandatory2fa: boolean;

  // Payments (Chapter 18)
  payments: {
    stripe: { secretKey?: string; webhookSecret?: string };
    paypal: { clientId?: string; clientSecret?: string };
    razorpay: { keyId?: string; keySecret?: string };
    sslcommerz: { storeId?: string; storePass?: string; isSandbox: boolean };
    bkash: { appKey?: string; appSecret?: string; username?: string; password?: string };
  };

  // Communications & Notifications (Chapter 17)
  communications: {
    twilio: { accountSid?: string; authToken?: string; phoneNumber?: string };
    whatsapp: { apiToken?: string; phoneNumberId?: string };
    smtp: { host?: string; port?: number; user?: string; pass?: string; from?: string };
  };

  // AI & RAG Automation (Chapter 14)
  ai: {
    openaiApiKey?: string;
    openaiModel: string;
  };

  // Cloud & Object Storage (Chapter 2 & 11)
  storage: {
    s3Bucket?: string;
    s3Region?: string;
    s3AccessKeyId?: string;
    s3SecretAccessKey?: string;
  };
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
    enableMandatory2fa: process.env.ENABLE_MANDATORY_2FA !== 'false',

    payments: {
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      },
      paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      },
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
      },
      sslcommerz: {
        storeId: process.env.SSLCOMMERZ_STORE_ID,
        storePass: process.env.SSLCOMMERZ_STORE_PASS,
        isSandbox: process.env.SSLCOMMERZ_IS_SANDBOX !== 'false',
      },
      bkash: {
        appKey: process.env.BKASH_APP_KEY,
        appSecret: process.env.BKASH_APP_SECRET,
        username: process.env.BKASH_USERNAME,
        password: process.env.BKASH_PASSWORD,
      },
    },

    communications: {
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
      },
      whatsapp: {
        apiToken: process.env.WHATSAPP_API_TOKEN,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      },
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM || 'no-reply@omnistay.com',
      },
    },

    ai: {
      openaiApiKey: process.env.OPENAI_API_KEY,
      openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    },

    storage: {
      s3Bucket: process.env.AWS_S3_BUCKET || 'omnistay-media',
      s3Region: process.env.AWS_REGION || 'us-east-1',
      s3AccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      s3SecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  };
}
