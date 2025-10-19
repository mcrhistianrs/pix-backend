import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const SwaggerCreateChargeResponse = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a new charge' }),
    ApiResponse({
      status: 201,
      description: 'Charge successfully created.',
      schema: {
        example: {
          charge_id: '507f1f77bcf86cd799439011',
          pix_key: 'user@example.com',
          expiration_date: '2024-03-21T10:00:00.000Z',
          status: 'pending',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request.',
      content: {
        'application/json': {
          examples: {
            invalidPayerDocument: {
              value: {
                message: 'Invalid payer document format.',
              },
            },
            invalidAmount: {
              value: {
                message: 'Amount must be greater than 0.',
              },
            },
            missingRequiredFields: {
              value: {
                message: 'All required fields must be provided.',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error.',
      content: {
        'application/json': {
          example: {
            message: 'Internal server error occurred while creating charge.',
          },
        },
      },
    }),
  );
