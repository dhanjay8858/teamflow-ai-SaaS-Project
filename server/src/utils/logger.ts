/**
 * TeamFlow AI — Structured Logger
 *
 * Development: human-readable text format with colors
 * Production:  JSON structured logs (compatible with Render log drains, Datadog, CloudWatch)
 *
 * Features:
 * - Sensitive field scrubbing (password, token, secret, authorization, cookie)
 * - Unique error ID generation for 5xx correlation
 * - LOG_LEVEL environment variable gating
 * - Consistent timestamp format (ISO 8601)
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Fields that must never appear in logs
const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'authorization',
  'cookie',
  'creditCard',
  'ssn',
]);

/** Recursively scrub sensitive keys from objects before logging */
const scrubSensitive = (obj: unknown, depth = 0): unknown => {
  if (depth > 5 || obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => scrubSensitive(item, depth + 1));
  }

  const scrubbed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.has(lowerKey) || [...SENSITIVE_FIELDS].some((f) => lowerKey.includes(f))) {
      scrubbed[key] = '[REDACTED]';
    } else {
      scrubbed[key] = scrubSensitive(value, depth + 1);
    }
  }
  return scrubbed;
};

/** Generate a short unique error correlation ID */
const generateErrorId = (): string => {
  return `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
};

const LEVEL_ORDER: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export class Logger {
  private readonly isProduction: boolean;
  private readonly minLevel: number;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    const configuredLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;
    this.minLevel = LEVEL_ORDER[configuredLevel] ?? LEVEL_ORDER.info;
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_ORDER[level] <= this.minLevel;
  }

  private formatText(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    let metaString = '';
    if (meta !== undefined && meta !== null) {
      const cleaned = meta instanceof Error
        ? { error: meta.message, stack: meta.stack }
        : scrubSensitive(meta);
      try {
        metaString = ` ${JSON.stringify(cleaned)}`;
      } catch {
        metaString = ' [Unserializable]';
      }
    }
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaString}`;
  }

  private formatJson(level: LogLevel, message: string, meta?: unknown, errorId?: string): string {
    const cleaned = meta instanceof Error
      ? { error: meta.message, stack: meta.stack }
      : meta !== undefined
        ? scrubSensitive(meta)
        : undefined;

    const entry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: 'teamflow-ai',
      version: process.env.APP_VERSION || '1.0.0',
      ...(errorId && { errorId }),
      ...(cleaned !== undefined && { meta: cleaned }),
    };

    return JSON.stringify(entry);
  }

  public info(message: string, meta?: unknown): void {
    if (!this.shouldLog('info')) return;
    const formatted = this.isProduction
      ? this.formatJson('info', message, meta)
      : this.formatText('info', message, meta);
    console.log(formatted);
  }

  public warn(message: string, meta?: unknown): void {
    if (!this.shouldLog('warn')) return;
    const formatted = this.isProduction
      ? this.formatJson('warn', message, meta)
      : this.formatText('warn', message, meta);
    console.warn(formatted);
  }

  public error(message: string, meta?: unknown): void {
    if (!this.shouldLog('error')) return;
    const errorId = generateErrorId();
    const formatted = this.isProduction
      ? this.formatJson('error', message, meta, errorId)
      : `${this.formatText('error', message, meta)} [errorId=${errorId}]`;
    console.error(formatted);
  }

  public debug(message: string, meta?: unknown): void {
    if (!this.shouldLog('debug')) return;
    const formatted = this.isProduction
      ? this.formatJson('debug', message, meta)
      : this.formatText('debug', message, meta);
    console.debug(formatted);
  }
}

export const logger = new Logger();

