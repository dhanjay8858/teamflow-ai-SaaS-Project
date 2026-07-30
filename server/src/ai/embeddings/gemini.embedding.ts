import {
  EmbeddingProvider,
  EmbeddingProviderHealthStatus,
} from '../types/embedding.types.js';
import { geminiProvider } from '../providers/gemini.provider.js';
import { aiConfig } from '../config/ai.config.js';

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  public readonly name = 'gemini';
  public readonly dimensions = 768;

  public async embedQuery(text: string): Promise<number[]> {
    return geminiProvider.embed(text);
  }

  public async embedDocuments(documents: string[]): Promise<number[][]> {
    return Promise.all(documents.map((doc) => this.embedQuery(doc)));
  }

  public async health(): Promise<EmbeddingProviderHealthStatus> {
    const providerHealth = await geminiProvider.health();
    return {
      provider: this.name,
      status: providerHealth.status,
      dimensions: this.dimensions,
      message: providerHealth.message,
    };
  }
}

export const geminiEmbeddingProvider = new GeminiEmbeddingProvider();
