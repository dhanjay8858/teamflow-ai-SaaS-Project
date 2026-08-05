import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // ── Core Server ────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/teamflow'),
  APP_VERSION: z.string().default('1.0.0'),
  GIT_COMMIT: z.string().optional(),

  // ── Authentication ─────────────────────────────────────────────────────────
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters').default('teamflow-access-token-secret-key-32chars-min'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters').default('teamflow-refresh-token-secret-key-32chars-min'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // ── Cloudinary ─────────────────────────────────────────────────────────────
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // ── SMTP & Email Notifications ─────────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform((val) => parseInt(val, 10)).optional().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('TeamFlow AI <no-reply@teamflow-ai.com>'),

  // ── Redis ──────────────────────────────────────────────────────────────────
  REDIS_ENABLED: z.string().transform((val) => val === 'true').default('false'),
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().transform((val) => parseInt(val, 10)).default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // ── Observability ──────────────────────────────────────────────────────────
  METRICS_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  ENABLE_REDIS_EVENTS: z.string().transform((val) => val === 'true').default('false'),

  // ── AI Providers ───────────────────────────────────────────────────────────
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),

  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),

  OLLAMA_URL: z.string().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().default('qwen3:8b'),
  OLLAMA_EMBEDDING_MODEL: z.string().default('nomic-embed-text:v1.5'),

  // ── AI Configuration Defaults ──────────────────────────────────────────────
  LLM_PROVIDER: z.enum(['groq', 'gemini', 'ollama']).default('groq'),
  EMBEDDING_PROVIDER: z.enum(['nomic', 'gemini', 'openai']).default('nomic'),
  VECTOR_STORE: z.enum(['mongodb', 'pinecone', 'weaviate']).default('mongodb'),

  // ── LLM Hyperparameters ────────────────────────────────────────────────────
  LLM_TIMEOUT_MS: z.string().transform((val) => parseInt(val, 10)).default('15000'),
  MAX_RETRIES: z.string().transform((val) => parseInt(val, 10)).default('2'),
  MAX_CONTEXT_TOKENS: z.string().transform((val) => parseInt(val, 10)).default('128000'),
  MAX_OUTPUT_TOKENS: z.string().transform((val) => parseInt(val, 10)).default('4096'),
  TEMPERATURE: z.string().transform((val) => parseFloat(val)).default('0.7'),
  TOP_P: z.string().transform((val) => parseFloat(val)).default('0.95'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();

