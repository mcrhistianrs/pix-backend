import { Inject, Injectable } from '@nestjs/common';
import { Charge } from '../../domain/entities/charge.entity';
import { IChargeDAO } from '../../domain/interfaces/charge.dao.interface';
import { ChargeOutputDTO } from '../dto/charge-output.dto';
import { CreateChargeDto } from '../dto/create-charge.dto';
import { ChargeMapper } from '../mapper/charge-mapper';

@Injectable()
export class CreateChargeUseCase {
  constructor(
    @Inject('IChargeDAO')
    private readonly chargeDAO: IChargeDAO,
  ) {}

  async execute(input: CreateChargeDto): Promise<ChargeOutputDTO> {
    const charge = Charge.create(
      input.payer_name,
      input.payer_document,
      input.amount,
      input.description,
    );

    charge.genereatePixKey(charge);
    charge.createdAt = new Date();
    const createdCharge = await this.chargeDAO.create(charge);
    return ChargeMapper.toOutputDTO(createdCharge);
  }
}
