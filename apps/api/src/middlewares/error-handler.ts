import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { logger } from '../config/logger.js';
import { HttpError } from '../utils/http-error.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: 'Validation failed',
      errors: error.flatten()
    });
  }

  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
  }

  logger.error(error instanceof Error ? error.message : 'Unexpected server error');

  return response.status(500).json({
    message: 'Internal server error'
  });
};
