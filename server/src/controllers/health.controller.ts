import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { isRedisHealthy } from '../config/redis.config.js';
import { env } from '../config/env.config.js';
import { register } from '../utils/metrics.js';

export class HealthController {
  public getHealth = async (_req: Request, res: Response): Promise<Response> => {
    const mongoConnected = mongoose.connection.readyState === 1;
    const redisHealthy = env.REDIS_ENABLED ? await isRedisHealthy() : true;
    const cloudinaryConfigured = !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY);
    const groqConfigured = !!(env.GROQ_API_KEY);
    const geminiConfigured = !!(env.GEMINI_API_KEY);

    const isFullyHealthy = mongoConnected && redisHealthy;

    const payload = {
      status: isFullyHealthy ? 'healthy' : mongoConnected ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: env.APP_VERSION,
      commit: env.GIT_COMMIT || 'unknown',
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMB: {
        rss: Math.round(process.memoryUsage().rss / (1024 * 1024)),
        heapTotal: Math.round(process.memoryUsage().heapTotal / (1024 * 1024)),
        heapUsed: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
      },
      services: {
        mongodb: {
          status: mongoConnected ? 'connected' : 'disconnected',
          readyState: mongoose.connection.readyState,
        },
        redis: {
          enabled: env.REDIS_ENABLED,
          status: env.REDIS_ENABLED
            ? redisHealthy ? 'connected' : 'disconnected'
            : 'disabled',
        },
        cloudinary: {
          status: cloudinaryConfigured ? 'configured' : 'unconfigured',
        },
        ai: {
          primaryProvider: env.LLM_PROVIDER,
          groq: groqConfigured ? 'configured' : 'unconfigured',
          gemini: geminiConfigured ? 'configured' : 'unconfigured',
          ollama: env.NODE_ENV === 'development' ? 'available' : 'disabled',
        },
      },
    };

    // Always return HTTP 200 for health probes so Render / load balancer deployment health check succeeds
    return res.status(200).json(payload);
  };

  public getReady = async (_req: Request, res: Response): Promise<Response> => {
    const mongoConnected = mongoose.connection.readyState === 1;
    const redisHealthy = env.REDIS_ENABLED ? await isRedisHealthy() : true;

    const isReady = mongoConnected && redisHealthy;
    return res.status(isReady ? 200 : 503).json({
      ready: isReady,
      mongodb: mongoConnected,
      redis: env.REDIS_ENABLED ? redisHealthy : 'disabled',
      timestamp: new Date().toISOString(),
    });
  };

  public getLive = (_req: Request, res: Response): Response => {
    return res.status(200).json({
      live: true,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  };

  public getMetrics = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (err: any) {
      res.status(500).end(err.message);
    }
  };
}

export const healthController = new HealthController();

