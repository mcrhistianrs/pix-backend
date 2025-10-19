import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { RabbitmqService } from '../../../../modules/rabbitmq/app/services/rabbitmq.service';
import { Charge } from '../../domain/entities/charge.entity';
import { IChargeDAO } from '../../domain/interfaces/charge.dao.interface';
import { CreateSimulationPaymentDto } from '../dto/create-simulation-payment.dto';
import { ErrorChargeOutputDTO } from '../dto/error-charge-output.dto';
import { CreateSimulationPaymentUseCase } from './create-simulation-payment.use-case';

describe('CreateSimulationPaymentUseCase', () => {
  let sut: CreateSimulationPaymentUseCase;
  let rabbitmqService: RabbitmqService;
  let chargeDAO: IChargeDAO;

  beforeEach(async () => {
    jest.useFakeTimers();
    const module = await Test.createTestingModule({
      providers: [
        CreateSimulationPaymentUseCase,
        {
          provide: RabbitmqService,
          useValue: {
            assertQueue: jest.fn(),
            publish: jest.fn(),
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

    rabbitmqService = module.get<RabbitmqService>(RabbitmqService);
    chargeDAO = module.get<IChargeDAO>('IChargeDAO');
    sut = module.get<CreateSimulationPaymentUseCase>(
      CreateSimulationPaymentUseCase,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should be able to create a simulation payment successfully', async () => {
    const input: CreateSimulationPaymentDto = {
      charge_id: 'charge-123',
    };

    const mockCharge = new Charge(
      {
        payerName: 'John Doe',
        payerDocument: '12345678901',
        amount: 100.5,
        description: 'Payment for services',
        status: 'pending',
        createdAt: new Date(),
        pixKey: 'mock-pix-key-123',
      },
      'charge-123',
    );

    const assertQueueSpy = jest
      .spyOn(rabbitmqService, 'assertQueue')
      .mockResolvedValue(undefined);
    const publishSpy = jest
      .spyOn(rabbitmqService, 'publish')
      .mockImplementation(() => true);
    const findByIdSpy = jest
      .spyOn(chargeDAO, 'findById')
      .mockResolvedValue(mockCharge);

    const result = await sut.execute(input);

    expect(findByIdSpy).toHaveBeenCalledWith('charge-123');
    expect(assertQueueSpy).toHaveBeenCalledWith('simulation_payment');
    expect(publishSpy).toHaveBeenCalledWith('simulation_payment', {
      charge_id: 'charge-123',
    });
    expect(result).toBeUndefined();
  });

  it('should return error when charge is not found', async () => {
    const input: CreateSimulationPaymentDto = {
      charge_id: 'non-existent-charge',
    };

    const findByIdSpy = jest
      .spyOn(chargeDAO, 'findById')
      .mockResolvedValue(null);

    const result = await sut.execute(input);

    const expectedError: ErrorChargeOutputDTO = {
      message: 'Charge not found',
    };

    expect(findByIdSpy).toHaveBeenCalledWith('non-existent-charge');
    expect(result).toEqual(expectedError);
  });

  it('should not publish to queue when charge is not found', async () => {
    const input: CreateSimulationPaymentDto = {
      charge_id: 'non-existent-charge',
    };

    const assertQueueSpy = jest
      .spyOn(rabbitmqService, 'assertQueue')
      .mockResolvedValue(undefined);
    const publishSpy = jest
      .spyOn(rabbitmqService, 'publish')
      .mockImplementation(() => true);
    const findByIdSpy = jest
      .spyOn(chargeDAO, 'findById')
      .mockResolvedValue(null);

    await sut.execute(input);

    expect(findByIdSpy).toHaveBeenCalledWith('non-existent-charge');
    expect(assertQueueSpy).not.toHaveBeenCalled();
    expect(publishSpy).not.toHaveBeenCalled();
  });

  it('should handle different charge IDs correctly', async () => {
    const testCases = [
      { charge_id: 'charge-001', description: 'First charge' },
      { charge_id: 'charge-abc-123', description: 'Charge with letters' },
      { charge_id: 'uuid-format-charge', description: 'UUID format charge' },
    ];

    for (const testCase of testCases) {
      const input: CreateSimulationPaymentDto = {
        charge_id: testCase.charge_id,
      };

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

      const assertQueueSpy = jest
        .spyOn(rabbitmqService, 'assertQueue')
        .mockResolvedValue(undefined);
      const publishSpy = jest
        .spyOn(rabbitmqService, 'publish')
        .mockImplementation(() => true);
      const findByIdSpy = jest
        .spyOn(chargeDAO, 'findById')
        .mockResolvedValue(mockCharge);

      const result = await sut.execute(input);

      expect(findByIdSpy).toHaveBeenCalledWith(testCase.charge_id);
      expect(assertQueueSpy).toHaveBeenCalledWith('simulation_payment');
      expect(publishSpy).toHaveBeenCalledWith('simulation_payment', {
        charge_id: testCase.charge_id,
      });
      expect(result).toBeUndefined();
    }
  });

  it('should propagate errors from the DAO layer', async () => {
    const input: CreateSimulationPaymentDto = {
      charge_id: 'charge-123',
    };

    const errorMessage = 'Database connection failed';
    const findByIdSpy = jest
      .spyOn(chargeDAO, 'findById')
      .mockRejectedValue(new Error(errorMessage));

    await expect(sut.execute(input)).rejects.toThrow(errorMessage);
    expect(findByIdSpy).toHaveBeenCalledWith('charge-123');
  });

  it('should propagate errors from the RabbitMQ service', async () => {
    const input: CreateSimulationPaymentDto = {
      charge_id: 'charge-123',
    };

    const mockCharge = new Charge(
      {
        payerName: 'John Doe',
        payerDocument: '12345678901',
        amount: 100,
        description: 'Payment for services',
        status: 'pending',
        createdAt: new Date(),
        pixKey: 'mock-pix-key-123',
      },
      'charge-123',
    );

    const errorMessage = 'RabbitMQ connection failed';
    const findByIdSpy = jest
      .spyOn(chargeDAO, 'findById')
      .mockResolvedValue(mockCharge);
    const assertQueueSpy = jest
      .spyOn(rabbitmqService, 'assertQueue')
      .mockRejectedValue(new Error(errorMessage));

    await expect(sut.execute(input)).rejects.toThrow(errorMessage);
    expect(findByIdSpy).toHaveBeenCalledWith('charge-123');
    expect(assertQueueSpy).toHaveBeenCalledWith('simulation_payment');
  });

  it('should handle empty charge_id gracefully', async () => {
    const input: CreateSimulationPaymentDto = {
      charge_id: '',
    };

    const findByIdSpy = jest
      .spyOn(chargeDAO, 'findById')
      .mockResolvedValue(null);

    const result = await sut.execute(input);

    const expectedError: ErrorChargeOutputDTO = {
      message: 'Charge not found',
    };

    expect(findByIdSpy).toHaveBeenCalledWith('');
    expect(result).toEqual(expectedError);
  });

  it('should work with charges in different statuses', async () => {
    const statuses: Array<'pending' | 'paid' | 'cancelled'> = [
      'pending',
      'paid',
      'cancelled',
    ];

    for (const status of statuses) {
      const input: CreateSimulationPaymentDto = {
        charge_id: `charge-${status}`,
      };

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
        `charge-${status}`,
      );

      const assertQueueSpy = jest
        .spyOn(rabbitmqService, 'assertQueue')
        .mockResolvedValue(undefined);
      const publishSpy = jest
        .spyOn(rabbitmqService, 'publish')
        .mockImplementation(() => true);
      const findByIdSpy = jest
        .spyOn(chargeDAO, 'findById')
        .mockResolvedValue(mockCharge);

      const result = await sut.execute(input);

      expect(findByIdSpy).toHaveBeenCalledWith(`charge-${status}`);
      expect(assertQueueSpy).toHaveBeenCalledWith('simulation_payment');
      expect(publishSpy).toHaveBeenCalledWith('simulation_payment', {
        charge_id: `charge-${status}`,
      });
      expect(result).toBeUndefined();
    }
  });
});
