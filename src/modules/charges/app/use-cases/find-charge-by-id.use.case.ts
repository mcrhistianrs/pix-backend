import { Inject, Injectable } from '@nestjs/common';
import { RedisService } from '../../../redis/app/services/redis.service';
import { IChargeDAO } from '../../domain/interfaces/charge.dao.interface';
import { ChargeOutputDTO } from '../dto/charge-output.dto';
import { ErrorChargeOutputDTO } from '../dto/error-charge-output.dto';
import { ChargeMapper } from '../mapper/charge-mapper';

@Injectable()
class FindChargeByIdUseCase {
  constructor(
    @Inject('IChargeDAO')
    private readonly chargeDAO: IChargeDAO,
    private readonly redisService: RedisService,
  ) {}

  async execute(id: string): Promise<ChargeOutputDTO | ErrorChargeOutputDTO> {
    const cacheKey = `charge:${id}`;
    const cachedCharge = await this.redisService.get(cacheKey);

    if (cachedCharge) {
      return JSON.parse(cachedCharge as string) as ChargeOutputDTO;
    }

    const charge = await this.chargeDAO.findById(id);
    if (!charge) {
      return {
        message: 'Occurred an error while trying to find the charge',
      };
    }
    await this.redisService.set(
      cacheKey,
      JSON.stringify(ChargeMapper.toOutputDTO(charge)),
    );

    return ChargeMapper.toOutputDTO(charge);
  }
}
export { FindChargeByIdUseCase };
