import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitmqService } from './app/services/rabbitmq.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [RabbitmqService],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}
