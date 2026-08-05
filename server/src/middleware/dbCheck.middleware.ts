import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse.js';

export const requireDatabaseConnection = (req: Request, res: Response, next: NextFunction): void | Response => {
  // Allow health checks even if DB is disconnected
  if (req.path.startsWith('/health') || req.path.startsWith('/live') || req.path.startsWith('/ready')) {
    return next();
  }

  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return ApiResponse.error({
      res,
      statusCode: 503,
      message: 'Database is not connected. Please verify that MONGODB_URI is set correctly in your Render Environment Variables.',
    });
  }

  return next();
};
