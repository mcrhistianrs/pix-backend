import { ApiProperty } from '@nestjs/swagger';

class CreateSimulationPaymentDto {
  @ApiProperty({
    description: 'ID of the charge to simulate payment for',
    example: '507f1f77bcf86cd799439011',
  })
  charge_id: string;
}

export { CreateSimulationPaymentDto };
