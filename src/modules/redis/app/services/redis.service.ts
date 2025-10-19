import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private logger: Logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = createClient({
      socket: {
        host: this.configService.get('REDIS_HOST') || 'localhost',
        port: parseInt(this.configService.get('REDIS_PORT') || '6379'),
      },
    });

    this.client.on('error', (err) =>
      this.logger.error('Redis Client Error', err),
    );
    this.client.on('connect', () => this.logger.log('Redis Client Connected'));
    this.client.on('ready', () => this.logger.log('Redis Client Ready'));

    await this.client.connect();
  }

  async get(key: string): Promise<string | null | object> {
    const result = await this.client.get(key);
    return result;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  async flushAll(): Promise<void> {
    await this.client.flushAll();
  }

  async ping(): Promise<string> {
    return await this.client.ping();
  }

  getClient(): RedisClientType {
    return this.client;
  }
}
