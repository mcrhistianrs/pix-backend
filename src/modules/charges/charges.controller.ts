import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ChargeOutputDTO } from './app/dto/charge-output.dto';
import { CreateChargeDto } from './app/dto/create-charge.dto';
import { CreateSimulationPaymentDto } from './app/dto/create-simulation-payment.dto';
import { ErrorChargeOutputDTO } from './app/dto/error-charge-output.dto';
import { SwaggerCreateChargeResponse } from './app/swagger/create-charge.swagger';
import { SwaggerCreateSimulationPaymentResponse } from './app/swagger/create-simulation-payment.swagger';
import { SwaggerFindChargeByIdResponse } from './app/swagger/find-charge-by-id.swagger';
import { CreateChargeUseCase } from './app/use-cases/create-charge.use-case';
import { CreateSimulationPaymentUseCase } from './app/use-cases/create-simulation-payment.use-case';
import { FindChargeByIdUseCase } from './app/use-cases/find-charge-by-id.use.case';

@Controller('charges')
export class ChargesController {
  constructor(
    private readonly createChargeUseCase: CreateChargeUseCase,
    private readonly findChargeByIdUseCase: FindChargeByIdUseCase,
    private readonly createSimulationPaymentUseCase: CreateSimulationPaymentUseCase,
  ) {}

  @Post()
  @SwaggerCreateChargeResponse()
  create(@Body() createChargeDto: CreateChargeDto): Promise<ChargeOutputDTO> {
    return this.createChargeUseCase.execute(createChargeDto);
  }

  @Get(':id')
  @SwaggerFindChargeByIdResponse()
  findById(
    @Param('id') id: string,
  ): Promise<ChargeOutputDTO | ErrorChargeOutputDTO> {
    return this.findChargeByIdUseCase.execute(id);
  }

  @Post('simulate-payment')
  @SwaggerCreateSimulationPaymentResponse()
  async simulatePayment(
    @Body() createSimulationPaymentDto: CreateSimulationPaymentDto,
  ): Promise<void | ErrorChargeOutputDTO> {
    const result = await this.createSimulationPaymentUseCase.execute(
      createSimulationPaymentDto,
    );
    if (result instanceof ErrorChargeOutputDTO) {
      throw new BadRequestException(result.message);
    }
    return result;
  }
}
