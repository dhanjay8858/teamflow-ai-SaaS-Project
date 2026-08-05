import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse.js';
import { connectDatabase, mongoAuthError } from '../config/db.config.js';

export const requireDatabaseConnection = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  // Allow health checks even if DB is disconnected
  if (req.path.startsWith('/health') || req.path.startsWith('/live') || req.path.startsWith('/ready')) {
    return next();
  }

  if (mongoAuthError) {
    return ApiResponse.error({
      res,
      statusCode: 500,
      message: 'MongoDB Atlas Authentication Failed: Incorrect database username or password. Please reset password in MongoDB Atlas (Database Access) and update MONGODB_URI on Render.',
    });
  }

  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if ((mongoose.connection.readyState as number) !== 1) {
    // If disconnected, trigger database connection in background
    if ((mongoose.connection.readyState as number) === 0) {
      connectDatabase().catch(() => {});
    }

    // Poll for up to 6 seconds for readyState to become 1 (connected)
    const startTime = Date.now();
    while ((mongoose.connection.readyState as number) !== 1 && !mongoAuthError && Date.now() - startTime < 6000) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    if (mongoAuthError) {
      return ApiResponse.error({
        res,
        statusCode: 500,
        message: 'MongoDB Atlas Authentication Failed: Incorrect database username or password. Please reset password in MongoDB Atlas (Database Access) and update MONGODB_URI on Render.',
      });
    }

    if ((mongoose.connection.readyState as number) !== 1) {
      return ApiResponse.error({
        res,
        statusCode: 503,
        message: 'Database connection is initializing or unavailable. Please wait a moment and try again.',
      });
    }
  }

  return next();
};
