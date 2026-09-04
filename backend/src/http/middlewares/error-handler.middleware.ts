import type { ErrorRequestHandler } from 'express';

import { AppError } from '../../shared/errors/app-error';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (isPrismaKnownError(error)) {
    if (error.code === 'P2025') {
      return response.status(404).json({
        message: 'Resource not found.',
      });
    }

    if (error.code === 'P2002') {
      return response.status(409).json({
        message: 'Resource already exists.',
      });
    }
  }

  console.error(error);

  return response.status(500).json({
    message: 'Internal server error',
  });
};

function isPrismaKnownError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}
