import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { RedisService } from '../../../../modules/redis/app/services/redis.service';
import { Charge } from '../../domain/entities/charge.entity';
import { IChargeDAO } from '../../domain/interfaces/charge.dao.interface';
import { ChargeOutputDTO } from '../dto/charge-output.dto';
import { ErrorChargeOutputDTO } from '../dto/error-charge-output.dto';
import { FindChargeByIdUseCase } from './find-charge-by-id.use.case';

describe('FindChargeByIdUseCase', () => {
  let sut: FindChargeByIdUseCase;
  let redisService: RedisService;
  let chargeDAO: IChargeDAO;

  beforeEach(async () => {
    jest.useFakeTimers();
    const module = await Test.createTestingModule({
      providers: [
        FindChargeByIdUseCase,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: 'IChargeDAO',
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
    chargeDAO = module.get<IChargeDAO>('IChargeDAO');
    sut = module.get<FindChargeByIdUseCase>(FindChargeByIdUseCase);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should return cached charge when found in cache', async () => {
    const chargeId = 'charge-123';
    const cachedChargeData = {
      charge_id: 'charge-123',
      pix_key: 'cached-pix-key-123',
      expiration_date: '2024-12-31T10:00:00.000Z',
      status: 'pending',
    };

    const getSpy = jest
      .spyOn(redisService, 'get')
      .mockResolvedValue(JSON.stringify(cachedChargeData));

    const result = await sut.execute(chargeId);

    expect(getSpy).toHaveBeenCalledWith(`charge:${chargeId}`);
    expect(result).toEqual(cachedChargeData);
  });

  it('should fetch from database and cache when not found in cache', async () => {
    const chargeId = 'charge-456';
    const mockCharge = new Charge(
      {
        payerName: 'Jane Smith',
        payerDocument: '98765432100',
        amount: 250.75,
        description: 'Monthly subscription',
        status: 'pending',
        createdAt: new Date(),
        pixKey: 'generated-pix-key-456',
      },
      'charge-456',
    );

    const expectedOutput: ChargeOutputDTO = {
      charge_id: 'charge-456',
      pix_key: 'generated-pix-key-456',
      expiration_date: new Date(),
      status: 'pending',
    };

    const getSpy = jest.spyOn(redisService, 'get').mockResolvedValue(null);
    const setSpy = jest.spyOn(redisService, 'set').mockResolvedValue(undefined);
    const findByIdSpy = jest
      .spyOn(chargeDAO, 'findById')
      .mockResolvedValue(mockCharge);

    const result = await sut.execute(chargeId);

    expect(getSpy).toHaveBeenCalledWith(`charge:${chargeId}`);
    expect(findByIdSpy).toHaveBeenCalledWith(chargeId);
    expect(setSpy).toHaveBeenCalledWith(
      `charge:${chargeId}`,
      JSON.stringify(expectedOutput),
    );
    expect(result).toEqual(expectedOutput);
  });

  it('should return error when charge is not found in database', async () => {
    const chargeId = 'non-existent-charge';

    const getSpy = jest.spyOn(redisService, 'get').mockResolvedValue(null);
    const findByIdSpy = jest
      .spyOn(chargeDAO, 'findById')
      .mockResolvedValue(null);

    const result = await sut.execute(chargeId);

    const expectedError: ErrorChargeOutputDTO = {
      message: 'Occurred an error while trying to find the charge',
    };

    expect(getSpy).toHaveBeenCalledWith(`charge:${chargeId}`);
    expect(findByIdSpy).toHaveBeenCalledWith(chargeId);
    expect(result).toEqual(expectedError);
  });

  it('should not cache when charge is not found', async () => {
    const chargeId = 'non-existent-charge';

    const getSpy = jest.spyOn(redisService, 'get').mockResolvedValue(null);
    const setSpy = jest.spyOn(redisService, 'set').mockResolvedValue(undefined);
    const findByIdSpy = jest
      .spyOn(chargeDAO, 'findById')
      .mockResolvedValue(null);

    await sut.execute(chargeId);

    expect(getSpy).toHaveBeenCalledWith(`charge:${chargeId}`);
    expect(findByIdSpy).toHaveBeenCalledWith(chargeId);
    expect(setSpy).not.toHaveBeenCalled();
  });

  it('should handle different charge IDs correctly', async () => {
    const testCases = [
      { charge_id: 'charge-001', description: 'First charge' },
      { charge_id: 'charge-abc-123', description: 'Charge with letters' },
      { charge_id: 'uuid-format-charge', description: 'UUID format charge' },
    ];

    for (const testCase of testCases) {
      const mockCharge = new Charge(
        {
          payerName: 'Test User',
          payerDocument: '12345678901',
          amount: 100,
          description: testCase.description,
          status: 'pending',
          createdAt: new Date(),
          pixKey: `pix-key-${testCase.charge_id}`,
        },
        testCase.charge_id,
      );

      const expectedOutput: ChargeOutputDTO = {
        charge_id: testCase.charge_id,
        pix_key: `pix-key-${testCase.charge_id}`,
        expiration_date: new Date(),
        status: 'pending',
      };

      const getSpy = jest.spyOn(redisService, 'get').mockResolvedValue(null);
      const setSpy = jest
        .spyOn(redisService, 'set')
        .mockResolvedValue(undefined);
      const findByIdSpy = jest
        .spyOn(chargeDAO, 'findById')
        .mockResolvedValue(mockCharge);

      const result = await sut.execute(testCase.charge_id);

      expect(getSpy).toHaveBeenCalledWith(`charge:${testCase.charge_id}`);
      expect(findByIdSpy).toHaveBeenCalledWith(testCase.charge_id);
      expect(setSpy).toHaveBeenCalledWith(
        `charge:${testCase.charge_id}`,
        JSON.stringify(expectedOutput),
      );
      expect(result).toEqual(expectedOutput);
    }
  });

  it('should propagate errors from the DAO layer', async () => {
    const chargeId = 'charge-123';

    const errorMessage = 'Database connection failed';
    const getSpy = jest.spyOn(redisService, 'get').mockResolvedValue(null);
    const findByIdSpy = jest
      .spyOn(chargeDAO, 'findById')
      .mockRejectedValue(new Error(errorMessage));

    await expect(sut.execute(chargeId)).rejects.toThrow(errorMessage);
    expect(getSpy).toHaveBeenCalledWith(`charge:${chargeId}`);
    expect(findByIdSpy).toHaveBeenCalledWith(chargeId);
  });

  it('should propagate errors from the Redis service', async () => {
    const chargeId = 'charge-123';

    const errorMessage = 'Redis connection failed';
    const getSpy = jest
      .spyOn(redisService, 'get')
      .mockRejectedValue(new Error(errorMessage));

    await expect(sut.execute(chargeId)).rejects.toThrow(errorMessage);
    expect(getSpy).toHaveBeenCalledWith(`charge:${chargeId}`);
  });

  it('should handle empty charge_id gracefully', async () => {
    const chargeId = '';

    const getSpy = jest.spyOn(redisService, 'get').mockResolvedValue(null);
    const findByIdSpy = jest
      .spyOn(chargeDAO, 'findById')
      .mockResolvedValue(null);

    const result = await sut.execute(chargeId);

    const expectedError: ErrorChargeOutputDTO = {
      message: 'Occurred an error while trying to find the charge',
    };

    expect(getSpy).toHaveBeenCalledWith(`charge:${chargeId}`);
    expect(findByIdSpy).toHaveBeenCalledWith(chargeId);
    expect(result).toEqual(expectedError);
  });

  it('should work with charges in different statuses', async () => {
    const statuses: Array<'pending' | 'paid' | 'cancelled'> = [
      'pending',
      'paid',
      'cancelled',
    ];

    for (const status of statuses) {
      const chargeId = `charge-${status}`;
      const mockCharge = new Charge(
        {
          payerName: 'Test User',
          payerDocument: '12345678901',
          amount: 100,
          description: `Charge with status ${status}`,
          status,
          createdAt: new Date(),
          pixKey: `pix-key-${status}`,
        },
        chargeId,
      );

      const expectedOutput: ChargeOutputDTO = {
        charge_id: chargeId,
        pix_key: `pix-key-${status}`,
        expiration_date: new Date(),
        status,
      };

      const getSpy = jest.spyOn(redisService, 'get').mockResolvedValue(null);
      const setSpy = jest
        .spyOn(redisService, 'set')
        .mockResolvedValue(undefined);
      const findByIdSpy = jest
        .spyOn(chargeDAO, 'findById')
        .mockResolvedValue(mockCharge);

      const result = await sut.execute(chargeId);

      expect(getSpy).toHaveBeenCalledWith(`charge:${chargeId}`);
      expect(findByIdSpy).toHaveBeenCalledWith(chargeId);
      expect(setSpy).toHaveBeenCalledWith(
        `charge:${chargeId}`,
        JSON.stringify(expectedOutput),
      );
      expect(result).toEqual(expectedOutput);
    }
  });

  it('should handle malformed cached data gracefully', async () => {
    const chargeId = 'charge-123';
    const malformedCacheData = 'invalid-json-data';

    const getSpy = jest
      .spyOn(redisService, 'get')
      .mockResolvedValue(malformedCacheData);

    await expect(sut.execute(chargeId)).rejects.toThrow();
    expect(getSpy).toHaveBeenCalledWith(`charge:${chargeId}`);
  });
});
