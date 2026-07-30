import { Response } from 'express';

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  public static success<T>({
    res,
    statusCode = 200,
    message = 'Success',
    data,
    meta,
  }: ApiResponseOptions<T>): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      ...(data !== undefined && { data }),
      ...(meta !== undefined && { meta }),
      timestamp: new Date().toISOString(),
    });
  }

  public static created<T>({
    res,
    message = 'Resource created successfully',
    data,
  }: Omit<ApiResponseOptions<T>, 'statusCode'>): Response {
    return this.success({ res, statusCode: 201, message, data });
  }

  public static error({
    res,
    statusCode = 500,
    message = 'An unexpected error occurred',
    errors,
  }: {
    res: Response;
    statusCode?: number;
    message?: string;
    errors?: unknown;
  }): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors !== undefined && { errors }),
      timestamp: new Date().toISOString(),
    });
  }
}
