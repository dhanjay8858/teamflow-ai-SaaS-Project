import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';

export const notFoundHandler = (req: Request, res: Response): Response => {
  return ApiResponse.error({
    res,
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl} - Route Not Found`,
  });
};
