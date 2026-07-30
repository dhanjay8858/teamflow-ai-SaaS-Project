import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const aiConfigSchema = z.object({
  GROQ_API_KEY: z.string().optional().default(process.env.GROQ_API_KEY || ''),
  GROQ_MODEL: z.string().default(process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'),
  
  GEMINI_API_KEY: z.string().optional().default(process.env.GEMINI_API_KEY || ''),
  GEMINI_MODEL: z.string().default(process.env.GEMINI_MODEL || 'gemini-1.5-flash'),

  OLLAMA_URL: z.string().default(process.env.OLLAMA_URL || 'http://localhost:11434'),
  OLLAMA_MODEL: z.string().default(process.env.OLLAMA_MODEL || 'llama3.1:8b'),
  OLLAMA_EMBEDDING_MODEL: z.string().default(process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text:v1.5'),

  LLM_PROVIDER: z.enum(['groq', 'gemini', 'ollama']).default('groq'),
  EMBEDDING_PROVIDER: z.enum(['nomic', 'gemini', 'openai']).default('nomic'),
  VECTOR_STORE: z.enum(['mongodb', 'chroma', 'qdrant', 'pinecone']).default('mongodb'),

  LLM_TIMEOUT_MS: z.number().default(15000),
  MAX_RETRIES: z.number().default(2),
  MAX_CONTEXT_TOKENS: z.number().default(128000),
  MAX_OUTPUT_TOKENS: z.number().default(4096),
  TEMPERATURE: z.number().min(0).max(2).default(0.7),
  TOP_P: z.number().min(0).max(1).default(0.95),
});

const parseAIConfig = () => {
  const rawConfig = {
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
    OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama3.1:8b',
    OLLAMA_EMBEDDING_MODEL: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text:v1.5',
    LLM_PROVIDER: process.env.LLM_PROVIDER || 'groq',
    EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER || 'nomic',
    VECTOR_STORE: process.env.VECTOR_STORE || 'mongodb',
    LLM_TIMEOUT_MS: process.env.LLM_TIMEOUT_MS ? parseInt(process.env.LLM_TIMEOUT_MS, 10) : 15000,
    MAX_RETRIES: process.env.MAX_RETRIES ? parseInt(process.env.MAX_RETRIES, 10) : 2,
    MAX_CONTEXT_TOKENS: process.env.MAX_CONTEXT_TOKENS ? parseInt(process.env.MAX_CONTEXT_TOKENS, 10) : 128000,
    MAX_OUTPUT_TOKENS: process.env.MAX_OUTPUT_TOKENS ? parseInt(process.env.MAX_OUTPUT_TOKENS, 10) : 4096,
    TEMPERATURE: process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : 0.7,
    TOP_P: process.env.TOP_P ? parseFloat(process.env.TOP_P) : 0.95,
  };

  const result = aiConfigSchema.safeParse(rawConfig);
  if (!result.success) {
    console.warn('⚠️ AI Configuration warning, fallback defaults used:', result.error.format());
    return aiConfigSchema.parse({});
  }
  return result.data;
};

export const aiConfig = parseAIConfig();
