import { Charge } from '../entities/charge.entity';

export type AllPendingChargesOf3NextMonthsQueryOutput = {
  month: string;
  totalCents: number;
};

export type FindByStudentIdInput = {
  studentId: string;
  accountId: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
};

export interface IChargeDAO {
  create(charge: Charge): Promise<Charge>;
}
