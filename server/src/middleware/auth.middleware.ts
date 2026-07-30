import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';
import { AppError } from '../utils/appError.js';
import { JwtAccessPayload, UserRole } from '../types/auth.types.js';
import { ACCESS_COOKIE_NAME } from '../config/cookie.config.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtAccessPayload;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
      token = req.cookies[ACCESS_COOKIE_NAME];
    }

    if (!token) {
      return next(AppError.unauthorized('Authentication token is missing'));
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
    req.user = decoded;
    return next();
  } catch {
    return next(AppError.unauthorized('Invalid or expired authentication token'));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('You do not have permission to perform this action'));
    }

    return next();
  };
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
      token = req.cookies[ACCESS_COOKIE_NAME];
    }

    if (token) {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
      req.user = decoded;
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  return next();
};
