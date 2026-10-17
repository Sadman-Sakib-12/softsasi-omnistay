import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis, RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private connected = false;

  private readonly host: string = process.env.REDIS_HOST || '127.0.0.1';
  private readonly port: number = parseInt(process.env.REDIS_PORT || '6379', 10);
  private readonly password?: string = process.env.REDIS_PASSWORD || undefined;

  async onModuleInit(): Promise<void> {
    try {
      this.client = new Redis({
        ...this.getConnectionOptions(),
        lazyConnect: true,
        connectTimeout: 5000,
        enableOfflineQueue: false,
        retryStrategy: (times: number) => {
          if (times > 3) {
            this.logger.warn(`Redis reconnection failed after ${times} attempts. Disabling retry loop.`);
            return null; // Stop retrying
          }
          return Math.min(times * 500, 2000);
        },
      });

      this.client.on('connect', () => {
        this.connected = true;
        this.logger.log(`Redis connected at ${this.host}:${this.port}`);
      });

      this.client.on('ready', () => {
        this.connected = true;
      });

      this.client.on('error', (err) => {
        this.connected = false;
        this.logger.warn(`Redis error: ${err.message}`);
      });

      this.client.on('close', () => {
        this.connected = false;
      });

      // Attempt initial connection without blocking app startup if Redis is down locally
      await this.client.connect().catch((err) => {
        this.connected = false;
        this.logger.warn(`Redis server not available at ${this.host}:${this.port}: ${err.message}`);
      });
    } catch (err: any) {
      this.connected = false;
      this.logger.warn(`Redis initialization skipped: ${err.message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      } finally {
        this.client = null;
        this.connected = false;
      }
    }
  }

  /**
   * Returns BullMQ-compatible connection options reusing this configuration.
   */
  getConnectionOptions(): RedisOptions {
    return {
      host: this.host,
      port: this.port,
      password: this.password,
      maxRetriesPerRequest: null, // Required by BullMQ
    };
  }

  /**
   * Returns whether Redis is connected and ready.
   */
  isReady(): boolean {
    return this.connected && this.client !== null && this.client.status === 'ready';
  }

  getClient(): Redis | null {
    return this.client;
  }

  async ping(): Promise<string> {
    if (!this.isReady() || !this.client) {
      throw new Error('Redis is not connected');
    }
    return this.client.ping();
  }

  async get(key: string): Promise<string | null> {
    if (!this.isReady() || !this.client) {
      return null;
    }
    try {
      return await this.client.get(key);
    } catch (err: any) {
      this.logger.warn(`Redis get failed for key "${key}": ${err.message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<string | null> {
    if (!this.isReady() || !this.client) {
      return null;
    }
    try {
      if (ttlSeconds) {
        return await this.client.set(key, value, 'EX', ttlSeconds);
      }
      return await this.client.set(key, value);
    } catch (err: any) {
      this.logger.warn(`Redis set failed for key "${key}": ${err.message}`);
      return null;
    }
  }

  async del(key: string): Promise<number> {
    if (!this.isReady() || !this.client) {
      return 0;
    }
    try {
      return await this.client.del(key);
    } catch (err: any) {
      this.logger.warn(`Redis del failed for key "${key}": ${err.message}`);
      return 0;
    }
  }

  /**
   * Atomically sets a key with a TTL only if it does not already exist (SET ... EX ... NX).
   * Returns:
   * - true: if the key was set (did not exist previously)
   * - false: if the key already exists (atomic replay prevention triggered)
   * - null: if Redis is disconnected or unavailable
   */
  async setIfNotExists(key: string, value: string, ttlSeconds: number): Promise<boolean | null> {
    if (!this.isReady() || !this.client) {
      return null;
    }
    try {
      const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch (err: any) {
      this.logger.warn(`Redis setNX failed for key "${key}": ${err.message}`);
      return null;
    }
  }

  async eval(script: string, numkeys: number, ...args: (string | number)[]): Promise<any> {
    if (!this.isReady() || !this.client) {
      throw new Error('Redis is not connected');
    }
    return (this.client as any).eval(script, numkeys, ...args);
  }
}
