import {
  LLMProvider,
  LLMGenerateInput,
  LLMGenerateOutput,
  LLMStreamChunk,
  ProviderHealthStatus,
} from '../types/provider.types.js';
import { groqProvider } from './groq.provider.js';
import { geminiProvider } from './gemini.provider.js';
import { ollamaProvider } from './ollama.provider.js';
import { aiConfig } from '../config/ai.config.js';
import { logger } from '../../utils/logger.js';

export interface ProviderMetrics {
  selectedProvider: string;
  fallbackCount: number;
  retryCount: number;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  circuitState: Record<string, 'CLOSED' | 'OPEN'>;
}

export class ProviderManager implements LLMProvider {
  public readonly name = 'provider-manager';
  private providers: LLMProvider[];
  private circuitState: Record<string, { isOpen: boolean; failures: number; nextAttempt: number }> = {
    groq: { isOpen: false, failures: 0, nextAttempt: 0 },
    gemini: { isOpen: false, failures: 0, nextAttempt: 0 },
    ollama: { isOpen: false, failures: 0, nextAttempt: 0 },
  };

  private metrics: ProviderMetrics = {
    selectedProvider: 'groq',
    fallbackCount: 0,
    retryCount: 0,
    latencyMs: 0,
    promptTokens: 0,
    completionTokens: 0,
    circuitState: { groq: 'CLOSED', gemini: 'CLOSED', ollama: 'CLOSED' },
  };

  constructor() {
    this.providers = [groqProvider, geminiProvider, ollamaProvider];
  }

  private isCircuitOpen(providerName: string): boolean {
    const state = this.circuitState[providerName];
    if (!state) return false;
    if (state.isOpen) {
      if (Date.now() > state.nextAttempt) {
        // Half-open attempt
        state.isOpen = false;
        state.failures = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  private recordFailure(providerName: string): void {
    const state = this.circuitState[providerName];
    if (state) {
      state.failures += 1;
      if (state.failures >= 3) {
        state.isOpen = true;
        state.nextAttempt = Date.now() + 60000; // Open circuit for 60 seconds
        logger.warn(`🔴 [ProviderManager] Circuit breaker OPEN for provider: ${providerName}`);
      }
    }
  }

  private recordSuccess(providerName: string): void {
    const state = this.circuitState[providerName];
    if (state) {
      state.failures = 0;
      state.isOpen = false;
    }
  }

  public getMetrics(): ProviderMetrics {
    const circuitSummary: Record<string, 'CLOSED' | 'OPEN'> = {};
    for (const [name, state] of Object.entries(this.circuitState)) {
      circuitSummary[name] = state.isOpen ? 'OPEN' : 'CLOSED';
    }
    return { ...this.metrics, circuitState: circuitSummary };
  }

  public async generate(input: LLMGenerateInput): Promise<LLMGenerateOutput> {
    const startTime = Date.now();
    let fallbackCount = 0;
    let totalRetries = 0;

    for (const provider of this.providers) {
      if (this.isCircuitOpen(provider.name)) {
        logger.debug(`⏭️ [ProviderManager] Skipping open circuit provider: ${provider.name}`);
        fallbackCount++;
        continue;
      }

      for (let attempt = 0; attempt <= aiConfig.MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            totalRetries++;
            const backoffMs = Math.pow(2, attempt) * 200;
            await new Promise((res) => setTimeout(res, backoffMs));
          }

          const result = await provider.generate(input);
          this.recordSuccess(provider.name);

          const latencyMs = Date.now() - startTime;
          this.metrics = {
            selectedProvider: provider.name,
            fallbackCount,
            retryCount: totalRetries,
            latencyMs,
            promptTokens: result.promptTokens,
            completionTokens: result.completionTokens,
            circuitState: this.metrics.circuitState,
          };

          return result;
        } catch (err: any) {
          logger.warn(`⚠️ [ProviderManager] Provider ${provider.name} attempt ${attempt + 1} failed: ${err?.message || String(err)}`);
          if (attempt === aiConfig.MAX_RETRIES) {
            this.recordFailure(provider.name);
            fallbackCount++;
          }
        }
      }
    }

    // Ultimate fallback if all configured providers fail or are unconfigured
    const latencyMs = Date.now() - startTime;
    return {
      text: `[TeamFlow AI Fallback] Output generated for prompt: "${input.prompt}"`,
      promptTokens: Math.ceil(input.prompt.length / 4),
      completionTokens: 15,
      totalTokens: Math.ceil(input.prompt.length / 4) + 15,
      model: 'standalone-fallback',
      provider: 'fallback-manager',
      finishReason: 'all_providers_failed',
    };
  }

  public async stream(
    input: LLMGenerateInput,
    onChunk: (chunk: LLMStreamChunk) => void
  ): Promise<LLMGenerateOutput> {
    const startTime = Date.now();
    let fallbackCount = 0;

    for (const provider of this.providers) {
      if (this.isCircuitOpen(provider.name)) {
        fallbackCount++;
        continue;
      }

      try {
        const result = await provider.stream(input, onChunk);
        this.recordSuccess(provider.name);
        this.metrics.selectedProvider = provider.name;
        this.metrics.fallbackCount = fallbackCount;
        this.metrics.latencyMs = Date.now() - startTime;
        return result;
      } catch (err: any) {
        logger.warn(`⚠️ [ProviderManager] Stream fallback from ${provider.name}: ${err?.message || String(err)}`);
        this.recordFailure(provider.name);
        fallbackCount++;
      }
    }

    // Fallback stream
    const fallbackText = `[TeamFlow AI Fallback Stream] Echo: "${input.prompt}"`;
    onChunk({ text: fallbackText, isComplete: true, model: 'standalone-fallback' });
    return {
      text: fallbackText,
      promptTokens: Math.ceil(input.prompt.length / 4),
      completionTokens: 15,
      totalTokens: Math.ceil(input.prompt.length / 4) + 15,
      model: 'standalone-fallback',
      provider: 'fallback-manager',
    };
  }

  public async embed(text: string): Promise<number[]> {
    return Array.from({ length: 768 }, (_, i) => Math.sin(i + text.length));
  }

  public async countTokens(text: string): Promise<number> {
    return Math.ceil(text.length / 4);
  }

  public async health(): Promise<ProviderHealthStatus> {
    const groqHealth = await groqProvider.health();
    const geminiHealth = await geminiProvider.health();
    const ollamaHealth = await ollamaProvider.health();

    const isAnyHealthy =
      groqHealth.status === 'healthy' ||
      geminiHealth.status === 'healthy' ||
      ollamaHealth.status === 'healthy';

    return {
      provider: 'provider-manager (Groq -> Gemini -> Ollama)',
      status: isAnyHealthy ? 'healthy' : 'unhealthy',
      message: `Groq [${groqHealth.status}], Gemini [${geminiHealth.status}], Ollama [${ollamaHealth.status}]`,
      latencyMs: groqHealth.latencyMs || geminiHealth.latencyMs || ollamaHealth.latencyMs || 0,
    };
  }
}

export const providerManager = new ProviderManager();
