import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongodbModule } from '../mongodb/mongodb.module';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { RedisModule } from '../redis/redis.module';
import { ProcessPaymentSimulationService } from './app/services/process-payment-simulation.service';
import { CreateChargeUseCase } from './app/use-cases/create-charge.use-case';
import { CreateSimulationPaymentUseCase } from './app/use-cases/create-simulation-payment.use-case';
import { FindChargeByIdUseCase } from './app/use-cases/find-charge-by-id.use.case';
import { PaymentSimulationWorker } from './app/workers/payment-simulation.worker';
import { ChargesController } from './charges.controller';
import { ChargePostgresDAO } from './infra/database/postgres/dao/charge-postgres-dao';
import { ChargeEntity } from './infra/database/postgres/entities/charge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChargeEntity]),
    forwardRef(() => RedisModule),
    forwardRef(() => RabbitmqModule),
    forwardRef(() => MongodbModule),
  ],
  controllers: [ChargesController],
  providers: [
    {
      provide: 'IChargeDAO',
      useClass: ChargePostgresDAO,
    },
    CreateChargeUseCase,
    CreateSimulationPaymentUseCase,
    FindChargeByIdUseCase,
    ProcessPaymentSimulationService,
    PaymentSimulationWorker,
  ],
})
export class ChargesModule {}
