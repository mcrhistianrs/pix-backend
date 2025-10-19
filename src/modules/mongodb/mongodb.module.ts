import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongodbService } from './app/services/mongodb.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [MongodbService],
  exports: [MongodbService],
})
export class MongodbModule {}
