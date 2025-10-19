import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChargeMapper } from '../../../../app/mapper/charge-mapper';
import { Charge } from '../../../../domain/entities/charge.entity';
import { IChargeDAO } from '../../../../domain/interfaces/charge.dao.interface';
import { ChargeEntity } from '../entities/charge.entity';

@Injectable()
export class ChargePostgresDAO implements IChargeDAO {
  constructor(
    @InjectRepository(ChargeEntity)
    private readonly instanceTypeOrmOfCharge: Repository<ChargeEntity>,
  ) {}

  async create(input: Charge): Promise<Charge> {
    const chargeDatabaseEntity = this.instanceTypeOrmOfCharge.create(
      ChargeMapper.toDatabase(input),
    );
    const charge =
      await this.instanceTypeOrmOfCharge.save(chargeDatabaseEntity);
    return ChargeMapper.toDomain(charge);
  }

  async findById(id: string): Promise<Charge | null> {
    const charge = await this.instanceTypeOrmOfCharge.findOne({
      where: { id },
    });
    if (!charge) {
      return null;
    }
    return ChargeMapper.toDomain(charge);
  }
}
