import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../redis/redis.module';
import { CreateChargeUseCase } from './app/use-cases/create-charge.use-case';
import { FindChargeByIdUseCase } from './app/use-cases/find-charge-by-id.use.case';
import { ChargesController } from './charges.controller';
import { ChargePostgresDAO } from './infra/database/postgres/dao/charge-postgres-dao';
import { ChargeEntity } from './infra/database/postgres/entities/charge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChargeEntity]),
    forwardRef(() => RedisModule),
  ],
  controllers: [ChargesController],
  providers: [
    {
      provide: 'IChargeDAO',
      useClass: ChargePostgresDAO,
    },
    CreateChargeUseCase,
    FindChargeByIdUseCase,
  ],
})
export class ChargesModule {}
