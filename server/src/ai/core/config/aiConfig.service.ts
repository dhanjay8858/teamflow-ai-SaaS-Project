import { aiConfig } from '../../config/ai.config.js';

export class AIConfigService {
  public getConfig() {
    return {
      providers: {
        primary: 'groq',
        cloudFallback: 'gemini',
        localFallback: 'ollama',
      },
      models: {
        groq: aiConfig.GROQ_MODEL,
        gemini: aiConfig.GEMINI_MODEL,
        ollama: aiConfig.OLLAMA_MODEL,
        embedding: aiConfig.OLLAMA_EMBEDDING_MODEL,
      },
      vectorStore: aiConfig.VECTOR_STORE,
      limits: {
        timeoutMs: aiConfig.LLM_TIMEOUT_MS,
        maxRetries: aiConfig.MAX_RETRIES,
        maxContextTokens: aiConfig.MAX_CONTEXT_TOKENS,
        maxOutputTokens: aiConfig.MAX_OUTPUT_TOKENS,
      },
      hyperparameters: {
        temperature: aiConfig.TEMPERATURE,
        topP: aiConfig.TOP_P,
      },
    };
  }
}

export const aiConfigService = new AIConfigService();
