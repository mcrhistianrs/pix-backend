import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

interface RabbitMQConnection {
  createChannel(): Promise<amqp.Channel>;
  on(event: string, callback: (...args: any[]) => void): void;
  close(): Promise<void>;
}

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private logger: Logger = new Logger(RabbitmqService.name);
  private connection: RabbitMQConnection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const host =
        this.configService.get<string>('RABBITMQ_HOST') || 'localhost';
      const port = this.configService.get<string>('RABBITMQ_PORT') || '5672';
      const user = this.configService.get<string>('RABBITMQ_USER') || 'guest';
      const password =
        this.configService.get<string>('RABBITMQ_PASS') || 'guest';

      const connectionUrl = `amqp://${user}:${password}@${host}:${port}`;

      this.connection = (await amqp.connect(
        connectionUrl,
      )) as RabbitMQConnection;
      this.channel = await this.connection.createChannel();

      this.connection.on('error', (err) =>
        this.logger.error('RabbitMQ Connection Error', err),
      );
      this.connection.on('close', () =>
        this.logger.warn('RabbitMQ Connection Closed'),
      );
      this.connection.on('connect', () =>
        this.logger.log('RabbitMQ Connected'),
      );

      this.channel.on('error', (err) =>
        this.logger.error('RabbitMQ Channel Error', err),
      );
      this.channel.on('close', () =>
        this.logger.warn('RabbitMQ Channel Closed'),
      );

      this.logger.log('RabbitMQ Service Initialized');
    } catch (error) {
      this.logger.error('Failed to initialize RabbitMQ', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('RabbitMQ Service Disconnected');
    } catch (error) {
      this.logger.error('Error during RabbitMQ cleanup', error);
    }
  }

  async assertQueue(
    queue: string,
    options?: amqp.Options.AssertQueue,
  ): Promise<amqp.Replies.AssertQueue> {
    if (!this.channel) throw new Error('Channel not initialized');
    return await this.channel.assertQueue(queue, options);
  }

  publish(
    queue: string,
    message: unknown,
    options?: amqp.Options.Publish,
  ): boolean {
    if (!this.channel) throw new Error('Channel not initialized');
    const messageBuffer = Buffer.from(JSON.stringify(message));
    return this.channel.sendToQueue(queue, messageBuffer, options);
  }

  async consume(
    queue: string,
    callback: (msg: amqp.ConsumeMessage | null) => void,
    options?: amqp.Options.Consume,
  ): Promise<amqp.Replies.Consume> {
    if (!this.channel) throw new Error('Channel not initialized');
    return await this.channel.consume(queue, callback, options);
  }

  ack(message: amqp.ConsumeMessage): void {
    if (!this.channel) throw new Error('Channel not initialized');
    this.channel.ack(message);
  }

  nack(
    message: amqp.ConsumeMessage,
    allUpTo?: boolean,
    requeue?: boolean,
  ): void {
    if (!this.channel) throw new Error('Channel not initialized');
    this.channel.nack(message, allUpTo, requeue);
  }

  async purgeQueue(queue: string): Promise<amqp.Replies.PurgeQueue> {
    if (!this.channel) throw new Error('Channel not initialized');
    return await this.channel.purgeQueue(queue);
  }

  async deleteQueue(
    queue: string,
    options?: amqp.Options.DeleteQueue,
  ): Promise<amqp.Replies.DeleteQueue> {
    if (!this.channel) throw new Error('Channel not initialized');
    return await this.channel.deleteQueue(queue, options);
  }

  async checkQueue(queue: string): Promise<amqp.Replies.AssertQueue> {
    if (!this.channel) throw new Error('Channel not initialized');
    return await this.channel.checkQueue(queue);
  }

  getChannel(): amqp.Channel | null {
    return this.channel;
  }

  getConnection(): RabbitMQConnection | null {
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection !== null;
  }
}
