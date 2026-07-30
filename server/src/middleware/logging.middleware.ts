import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { httpRequestDurationHistogram, httpRequestsTotal } from '../utils/metrics.js';

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const path = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    const userId = req.user?.userId || undefined;
    const workspaceId = (req.params?.workspaceId || req.query?.workspaceId || req.body?.workspaceId) as string | undefined;
    const projectId = (req.params?.projectId || req.query?.projectId || req.body?.projectId) as string | undefined;

    // Record metrics
    httpRequestsTotal.inc({ method, path, status: status.toString() });
    httpRequestDurationHistogram.observe({ method, path, status: status.toString() }, duration / 1000);

    const logMeta = {
      requestId: req.requestId,
      method,
      path,
      status,
      durationMs: duration,
      ip,
      ...(userId && { userId }),
      ...(workspaceId && { workspaceId }),
      ...(projectId && { projectId }),
    };

    if (status >= 500) {
      logger.error(`HTTP ${method} ${path} ${status} - ${duration}ms`, logMeta);
    } else if (status >= 400) {
      logger.warn(`HTTP ${method} ${path} ${status} - ${duration}ms`, logMeta);
    } else {
      logger.info(`HTTP ${method} ${path} ${status} - ${duration}ms`, logMeta);
    }
  });

  next();
};
