import { Charge } from '../entities/charge.entity';

export interface IChargeDAO {
  create(charge: Charge): Promise<Charge>;
  findById(id: string): Promise<Charge | null>;
}
