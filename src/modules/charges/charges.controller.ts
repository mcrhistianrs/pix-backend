import { Body, Controller, Post } from '@nestjs/common';
import { ChargeOutputDTO } from './app/dto/charge-output.dto';
import { CreateChargeDto } from './app/dto/create-charge.dto';
import { CreateChargeUseCase } from './app/use-cases/create-charge.use-case';

@Controller('charges')
export class ChargesController {
  constructor(private readonly createChargeUseCase: CreateChargeUseCase) {}

  @Post()
  create(@Body() createChargeDto: CreateChargeDto): Promise<ChargeOutputDTO> {
    return this.createChargeUseCase.execute(createChargeDto);
  }
}
