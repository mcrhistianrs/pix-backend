/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongodbService implements OnModuleInit {
  private readonly logger = new Logger(MongodbService.name);

  constructor(
    private configService: ConfigService,
    @InjectConnection() private connection: Connection,
  ) {}

  onModuleInit() {
    // Connection event handlers
    this.connection.on('connected', () => {
      this.logger.log('MongoDB Client Connected');
    });

    this.connection.on('error', (err) => {
      this.logger.error('MongoDB Client Error', err);
    });

    this.connection.on('disconnected', () => {
      this.logger.log('MongoDB Client Disconnected');
    });

    this.ping();
  }

  ping(): void {
    try {
      this.logger.log('MongoDB OK');
    } catch (error) {
      this.logger.error(
        'MongoDB ping failed:',
        error instanceof Error ? error.message : String(error),
      );
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  getConnection(): Connection {
    return this.connection;
  }

  getDatabase() {
    return this.connection.db;
  }

  getCollection(collectionName: string) {
    return this.connection.db.collection(collectionName);
  }

  async createIndex(
    collectionName: string,
    indexSpec: Record<
      string,
      1 | -1 | 'text' | '2d' | '2dsphere' | 'geoHaystack'
    >,
    options?: Record<string, unknown>,
  ) {
    const collection = this.getCollection(collectionName);
    return await collection.createIndex(indexSpec, options);
  }

  async dropCollection(collectionName: string) {
    const collection = this.getCollection(collectionName);
    return await collection.drop();
  }

  async listCollections() {
    const db = this.getDatabase();
    return await db.listCollections().toArray();
  }

  async getStats() {
    const db = this.getDatabase();
    return await db.stats();
  }

  isConnected(): boolean {
    return Number(this.connection.readyState) === 1;
  }

  async closeConnection(): Promise<void> {
    await this.connection.close();
  }
}
