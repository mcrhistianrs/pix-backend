import { Inject, Injectable } from '@nestjs/common';
import { RabbitmqService } from '../../../rabbitmq/app/services/rabbitmq.service';
import { IChargeDAO } from '../../domain/interfaces/charge.dao.interface';
import { CreateSimulationPaymentDto } from '../dto/create-simulation-payment.dto';
import { ErrorChargeOutputDTO } from '../dto/error-charge-output.dto';

@Injectable()
class CreateSimulationPaymentUseCase {
  constructor(
    private readonly rabbitmqService: RabbitmqService,
    @Inject('IChargeDAO')
    private readonly chargeDAO: IChargeDAO,
  ) {}

  async execute(
    input: CreateSimulationPaymentDto,
  ): Promise<void | ErrorChargeOutputDTO> {
    const { charge_id } = input;
    const charge = await this.chargeDAO.findById(charge_id);
    if (!charge) {
      return {
        message: 'Charge not found',
      };
    }
    await this.rabbitmqService.assertQueue('simulation_payment');
    this.rabbitmqService.publish('simulation_payment', { charge_id });
  }
}

export { CreateSimulationPaymentUseCase };
