import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

export const SwaggerFindChargeByIdResponse = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Find a charge by ID' }),
    ApiParam({
      name: 'id',
      description: 'Charge ID',
      example: '507f1f77bcf86cd799439011',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: 'Charge successfully found.',
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
      status: 404,
      description: 'Charge not found.',
      content: {
        'application/json': {
          example: {
            message: 'Occurred an error while trying to find the charge',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request.',
      content: {
        'application/json': {
          examples: {
            invalidId: {
              value: {
                message: 'Invalid charge ID format.',
              },
            },
            missingId: {
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
            message: 'Internal server error occurred while finding charge.',
          },
        },
      },
    }),
  );
