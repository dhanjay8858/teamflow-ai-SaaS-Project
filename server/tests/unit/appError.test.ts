import { describe, it, expect } from 'vitest';
import { AppError } from '../../src/utils/appError.js';

describe('AppError Utility Class', () => {
  it('should create a custom AppError with statusCode and operational flag', () => {
    const error = new AppError('Resource not found', 404);
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(true);
  });

  it('should be an instance of Error', () => {
    const error = new AppError('test', 500);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('should generate 400 badRequest error', () => {
    const error = AppError.badRequest('Invalid payload');
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invalid payload');
    expect(error.isOperational).toBe(true);
  });

  it('should generate 401 unauthorized error', () => {
    const error = AppError.unauthorized('Token expired');
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Token expired');
  });

  it('should generate 401 unauthorized with default message', () => {
    const error = AppError.unauthorized();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Unauthorized access');
  });

  it('should generate 403 forbidden error', () => {
    const error = AppError.forbidden('Access denied');
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Access denied');
  });

  it('should generate 403 forbidden with default message', () => {
    const error = AppError.forbidden();
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Forbidden resource');
  });

  it('should generate 404 notFound error', () => {
    const error = AppError.notFound('Task not found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Task not found');
  });

  it('should generate 404 notFound with default message', () => {
    const error = AppError.notFound();
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');
  });

  it('should generate 409 conflict error', () => {
    const error = AppError.conflict('Email already exists');
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Email already exists');
  });

  it('should generate 500 internalError (non-operational)', () => {
    const error = AppError.internal('Database error');
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Database error');
    expect(error.isOperational).toBe(false);
  });

  it('should generate 500 internalError with default message', () => {
    const error = AppError.internal();
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Internal server error');
  });

  it('should default to 500 statusCode when not provided', () => {
    const error = new AppError('Unexpected error');
    expect(error.statusCode).toBe(500);
  });
});
