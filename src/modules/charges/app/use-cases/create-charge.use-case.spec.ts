import { Test } from '@nestjs/testing';
import { Charge } from '../../domain/entities/charge.entity';
import { IChargeDAO } from '../../domain/interfaces/charge.dao.interface';
import { ChargeOutputDTO } from '../dto/charge-output.dto';
import { CreateChargeDto } from '../dto/create-charge.dto';
import { CreateChargeUseCase } from './create-charge.use-case';

describe('CreateChargeUseCase', () => {
  let sut: CreateChargeUseCase;
  let chargeDAO: IChargeDAO;

  beforeEach(async () => {
    jest.useFakeTimers();
    const module = await Test.createTestingModule({
      providers: [
        CreateChargeUseCase,
        {
          provide: 'IChargeDAO',
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    chargeDAO = module.get<IChargeDAO>('IChargeDAO');
    sut = module.get<CreateChargeUseCase>(CreateChargeUseCase);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should be able to create a charge successfully', async () => {
    const mockDate = new Date('2024-12-31T10:00:00Z');
    jest.setSystemTime(mockDate);

    const input: CreateChargeDto = {
      payer_name: 'John Doe',
      payer_document: '12345678901',
      amount: 100.5,
      description: 'Payment for services',
    };

    const mockCreatedCharge = new Charge(
      {
        payerName: input.payer_name,
        payerDocument: input.payer_document,
        amount: input.amount,
        description: input.description,
        status: 'pending',
        createdAt: mockDate,
        pixKey: 'mock-pix-key-123',
      },
      'charge-123',
    );

    const expectedOutput: ChargeOutputDTO = {
      charge_id: 'charge-123',
      pix_key: 'mock-pix-key-123',
      expiration_date: mockDate,
      status: 'pending',
    };

    const createSpy = jest
      .spyOn(chargeDAO, 'create')
      .mockResolvedValue(mockCreatedCharge);

    const result = await sut.execute(input);

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        payerName: input.payer_name,
        payerDocument: input.payer_document,
        amount: input.amount,
        description: input.description,
        status: 'pending',
        createdAt: mockDate,
      }),
    );
    expect(result).toEqual(expectedOutput);
  });

  it('should generate a PIX key when creating a charge', async () => {
    const input: CreateChargeDto = {
      payer_name: 'Jane Smith',
      payer_document: '98765432100',
      amount: 250.75,
      description: 'Monthly subscription',
    };

    const mockCreatedCharge = new Charge(
      {
        payerName: input.payer_name,
        payerDocument: input.payer_document,
        amount: input.amount,
        description: input.description,
        status: 'pending',
        createdAt: new Date(),
        pixKey: 'generated-pix-key-456',
      },
      'charge-456',
    );

    jest.spyOn(chargeDAO, 'create').mockResolvedValue(mockCreatedCharge);

    const result = await sut.execute(input);

    expect(result.pix_key).toBeDefined();
    expect(result.pix_key).toBe('generated-pix-key-456');
    expect(result.charge_id).toBe('charge-456');
    expect(result.status).toBe('pending');
  });

  it('should set the current date as createdAt when creating a charge', async () => {
    const mockDate = new Date('2024-01-15T14:30:00Z');
    jest.setSystemTime(mockDate);

    const input: CreateChargeDto = {
      payer_name: 'Bob Wilson',
      payer_document: '11122233344',
      amount: 75.25,
      description: 'Service fee',
    };

    const mockCreatedCharge = new Charge(
      {
        payerName: input.payer_name,
        payerDocument: input.payer_document,
        amount: input.amount,
        description: input.description,
        status: 'pending',
        createdAt: mockDate,
        pixKey: 'pix-key-789',
      },
      'charge-789',
    );

    const createSpy = jest
      .spyOn(chargeDAO, 'create')
      .mockResolvedValue(mockCreatedCharge);

    await sut.execute(input);

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: mockDate,
      }),
    );
  });

  it('should handle different charge amounts correctly', async () => {
    const testCases = [
      { amount: 0.01, description: 'Minimum amount' },
      { amount: 999999.99, description: 'Large amount' },
      { amount: 1, description: 'Integer amount' },
    ];

    for (const testCase of testCases) {
      const input: CreateChargeDto = {
        payer_name: 'Test User',
        payer_document: '12345678901',
        amount: testCase.amount,
        description: testCase.description,
      };

      const mockCreatedCharge = new Charge(
        {
          payerName: input.payer_name,
          payerDocument: input.payer_document,
          amount: input.amount,
          description: input.description,
          status: 'pending',
          createdAt: new Date(),
          pixKey: `pix-key-${testCase.amount}`,
        },
        `charge-${testCase.amount}`,
      );

      const createSpy = jest
        .spyOn(chargeDAO, 'create')
        .mockResolvedValue(mockCreatedCharge);

      const result = await sut.execute(input);

      expect(result.charge_id).toBe(`charge-${testCase.amount}`);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: testCase.amount,
        }),
      );
    }
  });

  it('should handle different document formats', async () => {
    const testCases = [
      { document: '12345678901', description: 'CPF format' },
      { document: '12345678000195', description: 'CNPJ format' },
      { document: '123456789', description: 'Short document' },
    ];

    for (const testCase of testCases) {
      const input: CreateChargeDto = {
        payer_name: 'Test User',
        payer_document: testCase.document,
        amount: 100,
        description: testCase.description,
      };

      const mockCreatedCharge = new Charge(
        {
          payerName: input.payer_name,
          payerDocument: input.payer_document,
          amount: input.amount,
          description: input.description,
          status: 'pending',
          createdAt: new Date(),
          pixKey: `pix-key-${testCase.document}`,
        },
        `charge-${testCase.document}`,
      );

      const createSpy = jest
        .spyOn(chargeDAO, 'create')
        .mockResolvedValue(mockCreatedCharge);

      const result = await sut.execute(input);

      expect(result.charge_id).toBe(`charge-${testCase.document}`);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payerDocument: testCase.document,
        }),
      );
    }
  });

  it('should propagate errors from the DAO layer', async () => {
    const input: CreateChargeDto = {
      payer_name: 'Error User',
      payer_document: '12345678901',
      amount: 100,
      description: 'This will cause an error',
    };

    const errorMessage = 'Database connection failed';
    jest.spyOn(chargeDAO, 'create').mockRejectedValue(new Error(errorMessage));

    await expect(sut.execute(input)).rejects.toThrow(errorMessage);
  });

  it('should handle empty or null values gracefully', async () => {
    const input: CreateChargeDto = {
      payer_name: '',
      payer_document: '',
      amount: 0,
      description: '',
    };

    const mockCreatedCharge = new Charge(
      {
        payerName: input.payer_name,
        payerDocument: input.payer_document,
        amount: input.amount,
        description: input.description,
        status: 'pending',
        createdAt: new Date(),
        pixKey: 'pix-key-empty',
      },
      'charge-empty',
    );

    const createSpy = jest
      .spyOn(chargeDAO, 'create')
      .mockResolvedValue(mockCreatedCharge);

    const result = await sut.execute(input);

    expect(result.charge_id).toBe('charge-empty');
    expect(result.status).toBe('pending');
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        payerName: '',
        payerDocument: '',
        amount: 0,
        description: '',
      }),
    );
  });
});
