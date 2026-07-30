import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incomingHeader = req.headers['x-request-id'];
  const requestId =
    typeof incomingHeader === 'string' && incomingHeader.trim()
      ? incomingHeader.trim()
      : randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
};
