import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChargeOutputDTO } from './app/dto/charge-output.dto';
import { CreateChargeDto } from './app/dto/create-charge.dto';
import { ErrorChargeOutputDTO } from './app/dto/error-charge-output.dto';
import { CreateChargeUseCase } from './app/use-cases/create-charge.use-case';
import { FindChargeByIdUseCase } from './app/use-cases/find-charge-by-id.use.case';

@Controller('charges')
export class ChargesController {
  constructor(
    private readonly createChargeUseCase: CreateChargeUseCase,
    private readonly findChargeByIdUseCase: FindChargeByIdUseCase,
  ) {}

  @Post()
  create(@Body() createChargeDto: CreateChargeDto): Promise<ChargeOutputDTO> {
    return this.createChargeUseCase.execute(createChargeDto);
  }

  @Get(':id')
  findById(
    @Param('id') id: string,
  ): Promise<ChargeOutputDTO | ErrorChargeOutputDTO> {
    return this.findChargeByIdUseCase.execute(id);
  }
}
