import { Charge } from '../../domain/entities/charge.entity';
import { ChargeEntity } from '../../infra/database/postgres/entities/charge.entity';
import { ChargeOutputDTO } from '../dto/charge-output.dto';

export class ChargeMapper {
  static toOutputDTO(charge: Charge): ChargeOutputDTO {
    return {
      charge_id: charge.id,
      pix_key: charge.pix_key || '',
      expiration_date: charge.expiration_date || new Date(),
      status: charge.status,
    };
  }
  static toDatabase(charge: Charge): ChargeEntity {
    const entity = new ChargeEntity();
    entity.id = charge.id;
    entity.payer_name = charge.payerName;
    entity.payer_document = charge.payerDocument;
    entity.amount = charge.amount;
    entity.description = charge.description;
    entity.pix_key = charge.pix_key;
    entity.expiration_date = charge.expiration_date;
    entity.status = charge.status;
    entity.createdAt = charge.createdAt;
    return entity;
  }

  static toDomain(entity: ChargeEntity): Charge {
    return new Charge(
      {
        payerName: entity.payer_name,
        payerDocument: entity.payer_document,
        amount: entity.amount,
        description: entity.description,
        pixKey: entity.pix_key,
        expirationDate: entity.expiration_date,
        status: entity.status,
        createdAt: entity.createdAt,
      },
      entity.id,
    );
  }
}
