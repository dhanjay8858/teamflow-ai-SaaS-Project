import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.config.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  if (err instanceof AppError) {
    return ApiResponse.error({
      res,
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  // Handle Mongoose Duplicate Key Error
  if ('code' in err && (err as { code?: number }).code === 11000) {
    return ApiResponse.error({
      res,
      statusCode: 409,
      message: 'Duplicate field value entered',
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    return ApiResponse.error({
      res,
      statusCode: 400,
      message: 'Database Validation Failed',
      errors: err.message,
    });
  }

  // Fallback for generic server error
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return ApiResponse.error({
    res,
    statusCode: 500,
    message,
    ...(env.NODE_ENV === 'development' && { errors: err.stack }),
  });
};
