import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  LLMProvider,
  LLMGenerateInput,
  LLMGenerateOutput,
  LLMStreamChunk,
  ProviderHealthStatus,
} from '../types/provider.types.js';
import { aiConfig } from '../config/ai.config.js';
import { logger } from '../../utils/logger.js';

export class GeminiProvider implements LLMProvider {
  public readonly name = 'gemini';
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (aiConfig.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(aiConfig.GEMINI_API_KEY);
    }
  }

  public async generate(input: LLMGenerateInput): Promise<LLMGenerateOutput> {
    if (!this.genAI) {
      throw new Error('[GeminiProvider] GEMINI_API_KEY is not configured');
    }

    try {
      const modelName = input.options?.model || aiConfig.GEMINI_MODEL;
      const model = this.genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: input.options?.systemPrompt,
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
        generationConfig: {
          temperature: input.options?.temperature ?? aiConfig.TEMPERATURE,
          topP: input.options?.topP ?? aiConfig.TOP_P,
          maxOutputTokens: input.options?.maxTokens ?? aiConfig.MAX_OUTPUT_TOKENS,
        },
      });

      const response = result.response;
      const text = response.text();

      const promptTokens = Math.ceil(input.prompt.length / 4);
      const completionTokens = Math.ceil(text.length / 4);

      return {
        text,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        model: modelName,
        provider: this.name,
      };
    } catch (err: any) {
      logger.warn(`⚠️ [GeminiProvider] Generate failed: ${err?.message || String(err)}`);
      throw err;
    }
  }

  public async stream(
    input: LLMGenerateInput,
    onChunk: (chunk: LLMStreamChunk) => void
  ): Promise<LLMGenerateOutput> {
    if (!this.genAI) {
      throw new Error('[GeminiProvider] GEMINI_API_KEY is not configured');
    }

    try {
      const modelName = input.options?.model || aiConfig.GEMINI_MODEL;
      const model = this.genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: input.options?.systemPrompt,
      });

      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
        generationConfig: {
          temperature: input.options?.temperature ?? aiConfig.TEMPERATURE,
          topP: input.options?.topP ?? aiConfig.TOP_P,
          maxOutputTokens: input.options?.maxTokens ?? aiConfig.MAX_OUTPUT_TOKENS,
        },
      });

      let accumulatedText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        onChunk({ text: chunkText, isComplete: false, model: modelName });
      }

      onChunk({ text: '', isComplete: true, model: modelName });

      const promptTokens = Math.ceil(input.prompt.length / 4);
      const completionTokens = Math.ceil(accumulatedText.length / 4);

      return {
        text: accumulatedText,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        model: modelName,
        provider: this.name,
      };
    } catch (err: any) {
      logger.warn(`⚠️ [GeminiProvider] Stream failed: ${err?.message || String(err)}`);
      throw err;
    }
  }

  public async embed(text: string): Promise<number[]> {
    if (!this.genAI) {
      return Array.from({ length: 768 }, (_, i) => Math.sin(i + text.length));
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: aiConfig.OLLAMA_EMBEDDING_MODEL });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err: any) {
      logger.warn(`⚠️ [GeminiProvider] Embed failed: ${err?.message || String(err)}.`);
      return Array.from({ length: 768 }, (_, i) => Math.sin(i + text.length));
    }
  }

  public async countTokens(text: string): Promise<number> {
    if (!this.genAI) return Math.ceil(text.length / 4);

    try {
      const model = this.genAI.getGenerativeModel({ model: aiConfig.GEMINI_MODEL });
      const countResult = await model.countTokens(text);
      return countResult.totalTokens;
    } catch {
      return Math.ceil(text.length / 4);
    }
  }

  public async health(): Promise<ProviderHealthStatus> {
    if (!this.genAI) {
      return {
        provider: this.name,
        status: 'unconfigured',
        message: 'GEMINI_API_KEY is not set',
      };
    }

    const start = Date.now();
    try {
      await this.countTokens('health check');
      return {
        provider: this.name,
        status: 'healthy',
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        provider: this.name,
        status: 'unhealthy',
        message: err?.message || 'Connection failed',
        latencyMs: Date.now() - start,
      };
    }
  }
}

export const geminiProvider = new GeminiProvider();
