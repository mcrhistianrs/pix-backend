import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const SwaggerCreateSimulationPaymentResponse = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a payment simulation' }),
    ApiResponse({
      status: 200,
      description: 'Payment simulation successfully queued.',
      schema: {
        example: null,
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request.',
      content: {
        'application/json': {
          examples: {
            chargeNotFound: {
              value: {
                message: 'Charge not found',
              },
            },
            invalidChargeId: {
              value: {
                message: 'Invalid charge ID format.',
              },
            },
            missingChargeId: {
              value: {
                message: 'Charge ID is required.',
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
            message:
              'Internal server error occurred while creating payment simulation.',
          },
        },
      },
    }),
  );
