import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { IChargeDAO } from '../../domain/interfaces/charge.dao.interface';

@Injectable()
export class ProcessPaymentSimulationService {
  private readonly logger = new Logger(ProcessPaymentSimulationService.name);

  constructor(
    @Inject('IChargeDAO') private readonly chargeDAO: IChargeDAO,
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  async process(charge_id: string): Promise<void> {
    try {
      const charge = await this.chargeDAO.findById(charge_id);

      if (!charge) {
        this.logger.error(`Charge ${charge_id} not found`);
        return;
      }

      const previousStatus = charge.status;

      const logsCollection = this.mongoConnection.db.collection(
        'simulate-payment-logs',
      );
      await logsCollection.insertOne({
        charge_id,
        received_at: new Date(),
        previous_status: previousStatus,
        new_status: 'paid',
      });

      this.logger.log(
        `Payment simulation logged for charge ${charge_id} (${previousStatus} -> paid)`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing payment simulation for charge ${charge_id}:`,
        error,
      );
      throw error;
    }
  }
}
