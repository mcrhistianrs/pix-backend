import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RabbitmqService } from '../../../rabbitmq/app/services/rabbitmq.service';
import { ProcessPaymentSimulationService } from '../services/process-payment-simulation.service';

@Injectable()
export class PaymentSimulationWorker implements OnModuleInit {
  private readonly logger = new Logger(PaymentSimulationWorker.name);

  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly processPaymentSimulationService: ProcessPaymentSimulationService,
  ) {}

  async onModuleInit() {
    await this.startConsuming();
  }

  private async handleMessage(msg: amqp.ConsumeMessage): Promise<void> {
    try {
      const content = JSON.parse(msg.content.toString()) as {
        charge_id: string;
      };
      const { charge_id } = content;

      this.logger.log(`Processing payment simulation for charge: ${charge_id}`);

      await this.processPaymentSimulationService.process(charge_id);

      this.rabbitmqService.ack(msg);
    } catch (error) {
      this.logger.error('Error processing message:', error);
      this.rabbitmqService.nack(msg, false, false);
    }
  }

  private async startConsuming(): Promise<void> {
    const queueName = 'simulation_payment';

    try {
      // Assert queue exists
      await this.rabbitmqService.assertQueue(queueName);

      this.logger.log(`Starting to consume from queue: ${queueName}`);

      // Start consuming messages
      await this.rabbitmqService.consume(
        queueName,
        (msg) => {
          if (msg !== null) {
            this.handleMessage(msg).catch((error) => {
              this.logger.error('Error processing message:', error);
            });
          }
        },
        { noAck: false },
      );

      this.logger.log(`Worker started successfully for queue: ${queueName}`);
    } catch (error) {
      this.logger.error(
        `Failed to start worker for queue ${queueName}:`,
        error,
      );
      throw error;
    }
  }
}
