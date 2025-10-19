import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongodbService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    @InjectConnection() private connection: Connection,
  ) {}

  async onModuleInit() {
    // Connection event handlers
    this.connection.on('connected', () => {
      console.log('MongoDB Client Connected');
    });

    this.connection.on('error', (err) => {
      console.error('MongoDB Client Error', err);
    });

    this.connection.on('disconnected', () => {
      console.log('MongoDB Client Disconnected');
    });

    // Test connection
    await this.ping();
  }

  async ping(): Promise<string> {
    try {
      const result = await this.connection.db.admin().ping();
      console.log('MongoDB ping successful:', result);
      return 'pong';
    } catch (error) {
      console.error('MongoDB ping failed:', error);
      throw error;
    }
  }

  async getConnection(): Promise<Connection> {
    return this.connection;
  }

  async getDatabase() {
    return this.connection.db;
  }

  async getCollection(collectionName: string) {
    return this.connection.db.collection(collectionName);
  }

  async createIndex(collectionName: string, indexSpec: any, options?: any) {
    const collection = await this.getCollection(collectionName);
    return await collection.createIndex(indexSpec, options);
  }

  async dropCollection(collectionName: string) {
    const collection = await this.getCollection(collectionName);
    return await collection.drop();
  }

  async listCollections() {
    const db = await this.getDatabase();
    return await db.listCollections().toArray();
  }

  async getStats() {
    const db = await this.getDatabase();
    return await db.stats();
  }

  async isConnected(): Promise<boolean> {
    return this.connection.readyState === 1;
  }

  async closeConnection(): Promise<void> {
    await this.connection.close();
  }
}
