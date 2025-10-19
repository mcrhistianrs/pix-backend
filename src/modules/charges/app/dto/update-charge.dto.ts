export class UpdateChargeDto {
  dueDate?: Date;
  amountCents?: number;
  status?: 'pending' | 'paid' | 'cancelled';
}
