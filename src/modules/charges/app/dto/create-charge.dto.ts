import { ApiProperty } from '@nestjs/swagger';

export class CreateChargeDto {
  @ApiProperty({
    description: 'Name of the payer',
    example: 'João Silva',
  })
  payer_name: string;

  @ApiProperty({
    description: 'Document number of the payer (CPF/CNPJ)',
    example: '12345678901',
  })
  payer_document: string;

  @ApiProperty({
    description: 'Amount to be charged',
    example: 100.5,
    minimum: 0.01,
  })
  amount: number;

  @ApiProperty({
    description: 'Description of the charge',
    example: 'Payment for services rendered',
  })
  description: string;
}
