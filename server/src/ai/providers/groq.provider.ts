import Groq from 'groq-sdk';
import {
  LLMProvider,
  LLMGenerateInput,
  LLMGenerateOutput,
  LLMStreamChunk,
  ProviderHealthStatus,
} from '../types/provider.types.js';
import { aiConfig } from '../config/ai.config.js';
import { logger } from '../../utils/logger.js';

export class GroqProvider implements LLMProvider {
  public readonly name = 'groq';
  private groq: Groq | null = null;

  constructor() {
    if (aiConfig.GROQ_API_KEY) {
      this.groq = new Groq({ apiKey: aiConfig.GROQ_API_KEY });
    }
  }

  public async generate(input: LLMGenerateInput): Promise<LLMGenerateOutput> {
    if (!this.groq) {
      throw new Error('[GroqProvider] GROQ_API_KEY is not configured');
    }

    try {
      const model = input.options?.model || aiConfig.GROQ_MODEL;
      const messages: any[] = [];
      if (input.options?.systemPrompt) {
        messages.push({ role: 'system', content: input.options.systemPrompt });
      }
      messages.push({ role: 'user', content: input.prompt });

      const completion = await this.groq.chat.completions.create({
        messages,
        model,
        temperature: input.options?.temperature ?? aiConfig.TEMPERATURE,
        max_tokens: input.options?.maxTokens ?? aiConfig.MAX_OUTPUT_TOKENS,
        top_p: input.options?.topP ?? aiConfig.TOP_P,
      });

      const text = completion.choices[0]?.message?.content || '';
      const promptTokens = completion.usage?.prompt_tokens || Math.ceil(input.prompt.length / 4);
      const completionTokens = completion.usage?.completion_tokens || Math.ceil(text.length / 4);

      return {
        text,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        model,
        provider: this.name,
        finishReason: completion.choices[0]?.finish_reason || 'stop',
      };
    } catch (err: any) {
      logger.warn(`⚠️ [GroqProvider] Generate failed: ${err?.message || String(err)}`);
      throw err;
    }
  }

  public async stream(
    input: LLMGenerateInput,
    onChunk: (chunk: LLMStreamChunk) => void
  ): Promise<LLMGenerateOutput> {
    if (!this.groq) {
      throw new Error('[GroqProvider] GROQ_API_KEY is not configured');
    }

    try {
      const model = input.options?.model || aiConfig.GROQ_MODEL;
      const messages: any[] = [];
      if (input.options?.systemPrompt) {
        messages.push({ role: 'system', content: input.options.systemPrompt });
      }
      messages.push({ role: 'user', content: input.prompt });

      const stream = await this.groq.chat.completions.create({
        messages,
        model,
        temperature: input.options?.temperature ?? aiConfig.TEMPERATURE,
        max_tokens: input.options?.maxTokens ?? aiConfig.MAX_OUTPUT_TOKENS,
        top_p: input.options?.topP ?? aiConfig.TOP_P,
        stream: true,
      });

      let accumulatedText = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          accumulatedText += content;
          onChunk({ text: content, isComplete: false, model });
        }
      }

      onChunk({ text: '', isComplete: true, model });

      const promptTokens = Math.ceil(input.prompt.length / 4);
      const completionTokens = Math.ceil(accumulatedText.length / 4);

      return {
        text: accumulatedText,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        model,
        provider: this.name,
      };
    } catch (err: any) {
      logger.warn(`⚠️ [GroqProvider] Stream failed: ${err?.message || String(err)}`);
      throw err;
    }
  }

  public async embed(text: string): Promise<number[]> {
    // Groq focuses on ultra-fast LLM inference; fallback deterministic vector
    return Array.from({ length: 768 }, (_, i) => Math.sin(i + text.length));
  }

  public async countTokens(text: string): Promise<number> {
    return Math.ceil(text.length / 4);
  }

  public async health(): Promise<ProviderHealthStatus> {
    if (!this.groq) {
      return {
        provider: this.name,
        status: 'unconfigured',
        message: 'GROQ_API_KEY is not set',
      };
    }

    const start = Date.now();
    try {
      await this.generate({ prompt: 'ping', options: { maxTokens: 5 } });
      return {
        provider: this.name,
        status: 'healthy',
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        provider: this.name,
        status: 'unhealthy',
        message: err?.message || 'Groq connection error',
        latencyMs: Date.now() - start,
      };
    }
  }
}

export const groqProvider = new GroqProvider();
