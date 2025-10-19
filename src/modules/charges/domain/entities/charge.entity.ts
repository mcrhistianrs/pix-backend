import { randomUUID } from 'crypto';

interface ChargeFields {
  _id?: string;
  payerName: string;
  payerDocument: string;
  amount: number;
  description: string;
  pixKey?: string;
  expirationDate?: Date;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt?: Date;
}

export class Charge {
  constructor(
    private fields: ChargeFields,
    id?: string,
  ) {
    this.fields = fields;
    this.fields._id = id ?? randomUUID();
  }

  static create(
    payerName: string,
    payerDocument: string,
    amount: number,
    description: string,
  ): Charge {
    return new Charge({
      payerName,
      payerDocument,
      amount,
      description,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  get id(): string {
    return this.fields._id;
  }

  get payerName(): string {
    return this.fields.payerName;
  }
  set payerName(payerName: string) {
    this.fields.payerName = payerName;
  }

  get payerDocument(): string {
    return this.fields.payerDocument;
  }
  set payerDocument(payerDocument: string) {
    this.fields.payerDocument = payerDocument;
  }

  get description(): string {
    return this.fields.description;
  }
  set description(description: string) {
    this.fields.description = description;
  }

  get pix_key(): string | undefined {
    return this.fields.pixKey;
  }
  set pixKey(pixKey: string | undefined) {
    this.fields.pixKey = pixKey;
  }

  get expiration_date(): Date | undefined {
    return this.fields.expirationDate;
  }
  set expirationDate(expirationDate: Date | undefined) {
    this.fields.expirationDate = expirationDate;
  }

  get amount(): number {
    return this.fields.amount;
  }
  set amount(amount: number) {
    this.fields.amount = amount;
  }

  get status(): 'pending' | 'paid' | 'cancelled' {
    return this.fields.status;
  }
  set status(status: 'pending' | 'paid' | 'cancelled') {
    this.fields.status = status;
  }

  get createdAt(): Date | undefined {
    return this.fields.createdAt;
  }

  set createdAt(createdAt: Date | undefined) {
    this.fields.createdAt = createdAt;
  }

  markAsPaid(): Charge {
    return new Charge(
      {
        ...this.fields,
        status: 'paid',
      },
      this.id,
    );
  }

  cancel(): Charge {
    return new Charge(
      {
        ...this.fields,
        status: 'cancelled',
      },
      this.id,
    );
  }

  genereatePixKey() {
    this.pixKey = randomUUID();
  }
}
