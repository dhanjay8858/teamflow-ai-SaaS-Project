import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { env } from './config/env.config.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { requestIdMiddleware } from './middleware/requestId.middleware.js';
import { requestLoggerMiddleware } from './middleware/logging.middleware.js';
import { healthController } from './controllers/health.controller.js';

/**
 * Parse CLIENT_URL — supports comma-separated values for multi-origin CORS.
 * e.g., "https://teamflow.vercel.app,http://localhost:3000"
 */
const getAllowedOrigins = (): string[] => {
  return env.CLIENT_URL
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const createApp = (): Application => {
  const app: Application = express();
  const allowedOrigins = getAllowedOrigins();
  const isProduction = env.NODE_ENV === 'production';

  // ── Reverse Proxy Trust (Render / Vercel / Kubernetes) ────────────────────
  // Required for correct IP extraction and rate limiting behind load balancers
  app.set('trust proxy', 1);

  // ── Gzip Compression ──────────────────────────────────────────────────────
  // Compresses responses > 1KB — reduces bandwidth by 60-80%
  app.use(compression());

  // ── Security Headers (Helmet) ─────────────────────────────────────────────
  app.use(
    helmet({
      // Content Security Policy — restrict resource origins
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
              connectSrc: ["'self'", ...allowedOrigins],
              fontSrc: ["'self'", 'https://fonts.gstatic.com'],
              objectSrc: ["'none'"],
              frameSrc: ["'none'"],
            },
          }
        : false, // Disabled in development for convenience

      // Cross-Origin headers
      crossOriginEmbedderPolicy: false,    // Allow Cloudinary media embeds
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // ── CORS ──────────────────────────────────────────────────────────────────
  // credentials: true required for cross-origin cookie support (sameSite: none)
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        // Allow server-to-server requests (no origin) and allowed origins
        if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: Origin ${requestOrigin} not allowed`));
        }
      },
      credentials: true,           // Required for cross-origin cookie support
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID'],
    })
  );

  // ── Request Parsing ────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // ── Request Correlation ID & Structured Logging ────────────────────────────
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  // ── Infrastructure Endpoints (Kubernetes / Render health probes) ───────────
  app.get('/health', healthController.getHealth);
  app.get('/ready', healthController.getReady);
  app.get('/live', healthController.getLive);
  app.get('/metrics', healthController.getMetrics);

  // ── API Routes (/api/v1/...) ───────────────────────────────────────────────
  app.use('/api/v1', apiRouter);

  // ── 404 & Global Error Middleware ──────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

