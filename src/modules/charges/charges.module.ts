import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateChargeUseCase } from './app/use-cases/create-charge.use-case';
import { ChargesController } from './charges.controller';
import { ChargePostgresDAO } from './infra/database/postgres/dao/charge-postgres-dao';
import { ChargeEntity } from './infra/database/postgres/entities/charge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChargeEntity]),
  ],
  controllers: [ChargesController],
  providers: [
    {
      provide: 'IChargeDAO',
      useClass: ChargePostgresDAO,
    },
    CreateChargeUseCase,
  ],
})
export class ChargesModule {}
