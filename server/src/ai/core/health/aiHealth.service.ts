import { groqProvider } from '../../providers/groq.provider.js';
import { geminiProvider } from '../../providers/gemini.provider.js';
import { ollamaProvider } from '../../providers/ollama.provider.js';
import { nomicEmbeddingProvider } from '../../embeddings/nomic.embedding.js';
import { mongoDBVectorStore } from '../../vector/mongodb.vector.js';
import { promptRegistry } from '../registries/prompt.registry.js';
import { plannerRegistry } from '../registries/planner.registry.js';
import { toolRegistry } from '../registries/tool.registry.js';

export class AIHealthService {
  public async getHealth() {
    const start = Date.now();
    const [groq, gemini, ollama, embedding, vector] = await Promise.all([
      groqProvider.health(),
      geminiProvider.health(),
      ollamaProvider.health(),
      nomicEmbeddingProvider.health(),
      mongoDBVectorStore.health(),
    ]);

    const isHealthy =
      groq.status === 'healthy' ||
      gemini.status === 'healthy' ||
      ollama.status === 'healthy';

    const registries = {
      prompts: promptRegistry.list().length,
      planners: plannerRegistry.list().length,
      tools: toolRegistry.list().length,
    };

    return {
      status: isHealthy ? 'HEALTHY' : 'DEGRADED',
      latencyMs: Date.now() - start,
      providers: {
        groq,
        gemini,
        ollama,
      },
      embeddings: embedding,
      vectorStore: vector,
      registries,
    };
  }
}

export const aiHealthService = new AIHealthService();
