import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('charges')
export class ChargeEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'payer_name' })
  payer_name: string;

  @Column({ name: 'payer_document' })
  payer_document: string;

  @Column({ name: 'amount' })
  amount: number;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'pix_key', nullable: true })
  pix_key?: string;

  @Column({ name: 'expiration_date', nullable: true })
  expiration_date?: Date;

  @Column({
    type: 'text',
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'paid' | 'cancelled';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
