export class ChargeOutputDTO {
  charge_id: string;
  pix_key: string;
  expiration_date: Date;
  status: 'pending' | 'paid' | 'cancelled';
}
