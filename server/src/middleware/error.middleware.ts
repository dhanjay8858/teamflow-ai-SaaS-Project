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

  // Handle Mongoose / MongoDB Duplicate Key Error (E11000)
  const isDuplicateKey =
    ('code' in err && (err as any).code == 11000) ||
    (err.message && err.message.includes('E11000'));

  if (isDuplicateKey) {
    const isEmail = err.message && err.message.includes('email');
    const isUsername = err.message && err.message.includes('username');
    const fieldMsg = isEmail
      ? 'An account with this email address already exists'
      : isUsername
      ? 'This username is already taken'
      : 'An account with this email address or username already exists';

    return ApiResponse.error({
      res,
      statusCode: 409,
      message: fieldMsg,
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    return ApiResponse.error({
      res,
      statusCode: 400,
      message: err.message || 'Database Validation Failed',
      errors: err.message,
    });
  }

  // Fallback for generic server error
  const message = env.NODE_ENV === 'production' && !err.message
    ? 'Internal server error'
    : err.message || 'Internal server error';

  return ApiResponse.error({
    res,
    statusCode: 500,
    message,
    ...(env.NODE_ENV === 'development' && { errors: err.stack }),
  });
};
