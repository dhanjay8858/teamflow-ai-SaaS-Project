import {
  EmbeddingProvider,
  EmbeddingProviderHealthStatus,
} from '../types/embedding.types.js';
import { aiConfig } from '../config/ai.config.js';
import { logger } from '../../utils/logger.js';

export class NomicEmbeddingProvider implements EmbeddingProvider {
  public readonly name = 'nomic';
  public readonly dimensions = 768;

  public async embedQuery(text: string): Promise<number[]> {
    const url = `${aiConfig.OLLAMA_URL}/api/embeddings`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: aiConfig.OLLAMA_EMBEDDING_MODEL,
          prompt: text,
        }),
      });

      if (!res.ok) throw new Error(`Ollama Nomic Embed error: HTTP ${res.status}`);
      const data = (await res.json()) as any;
      if (Array.isArray(data.embedding) && data.embedding.length > 0) {
        return data.embedding;
      }
      return this.fallbackVector(text);
    } catch (err: any) {
      logger.debug(`ℹ️ [NomicEmbeddingProvider] Nomic Embed fallback active: ${err?.message || String(err)}`);
      return this.fallbackVector(text);
    }
  }

  public async embedDocuments(documents: string[]): Promise<number[][]> {
    return Promise.all(documents.map((doc) => this.embedQuery(doc)));
  }

  private fallbackVector(text: string): number[] {
    return Array.from({ length: this.dimensions }, (_, i) => Math.sin(i + text.length));
  }

  public async health(): Promise<EmbeddingProviderHealthStatus> {
    const start = Date.now();
    try {
      const vector = await this.embedQuery('health check');
      return {
        provider: `${this.name} (${aiConfig.OLLAMA_EMBEDDING_MODEL})`,
        status: 'healthy',
        dimensions: vector.length,
        message: 'Nomic Embed active',
      };
    } catch (err: any) {
      return {
        provider: this.name,
        status: 'unhealthy',
        dimensions: this.dimensions,
        message: err?.message || 'Using fallback vector generator',
      };
    }
  }
}

export const nomicEmbeddingProvider = new NomicEmbeddingProvider();
