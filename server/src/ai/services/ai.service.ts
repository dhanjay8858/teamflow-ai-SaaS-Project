import { providerManager } from '../providers/provider.manager.js';
import { groqProvider } from '../providers/groq.provider.js';
import { geminiProvider } from '../providers/gemini.provider.js';
import { ollamaProvider } from '../providers/ollama.provider.js';
import { nomicEmbeddingProvider } from '../embeddings/nomic.embedding.js';
import { mongoDBVectorStore } from '../vector/mongodb.vector.js';
import { workflowGraph } from '../graphs/workflow.graph.js';
import { aiConfig } from '../config/ai.config.js';
import { membershipRepository, MembershipRepository } from '../../repositories/membership.repository.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';
import { LLMStreamChunk } from '../types/provider.types.js';

export class AIService {
  constructor(private wsMemberRepo: MembershipRepository = membershipRepository) {}

  private async verifyWorkspaceAccess(userId: string, workspaceId: string): Promise<void> {
    const membership = await this.wsMemberRepo.findByUserAndWorkspace(userId, workspaceId);
    if (!membership) {
      throw AppError.forbidden('You are not a member of this workspace');
    }
  }

  public async getHealth() {
    const start = Date.now();
    const [groqHealth, geminiHealth, ollamaHealth, embeddingHealth, vectorHealth] = await Promise.all([
      groqProvider.health(),
      geminiProvider.health(),
      ollamaProvider.health(),
      nomicEmbeddingProvider.health(),
      mongoDBVectorStore.health(),
    ]);

    const isHealthy =
      groqHealth.status === 'healthy' ||
      geminiHealth.status === 'healthy' ||
      ollamaHealth.status === 'healthy';

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      latencyMs: Date.now() - start,
      fallbackChain: 'Groq (Primary) -> Gemini (Cloud Fallback) -> Ollama (Local Fallback)',
      providers: {
        groq: { ...groqHealth, currentModel: aiConfig.GROQ_MODEL },
        gemini: { ...geminiHealth, currentModel: aiConfig.GEMINI_MODEL },
        ollama: { ...ollamaHealth, currentModel: aiConfig.OLLAMA_MODEL },
        embedding: { ...embeddingHealth, currentModel: aiConfig.OLLAMA_EMBEDDING_MODEL },
        vectorStore: vectorHealth,
      },
      metrics: providerManager.getMetrics(),
      config: {
        groqModel: aiConfig.GROQ_MODEL,
        geminiModel: aiConfig.GEMINI_MODEL,
        ollamaModel: aiConfig.OLLAMA_MODEL,
        embeddingModel: aiConfig.OLLAMA_EMBEDDING_MODEL,
        llmTimeoutMs: aiConfig.LLM_TIMEOUT_MS,
        maxRetries: aiConfig.MAX_RETRIES,
      },
    };
  }

  public async getProviders() {
    return {
      primaryLLMProvider: 'groq',
      fallbackChain: ['groq', 'gemini', 'ollama'],
      activeEmbeddingProvider: aiConfig.EMBEDDING_PROVIDER,
      activeVectorStore: aiConfig.VECTOR_STORE,
      availableProviders: ['groq', 'gemini', 'ollama', 'openai', 'anthropic'],
      availableEmbeddings: ['nomic', 'gemini', 'openai', 'voyageai'],
      availableVectorStores: ['mongodb', 'chroma', 'qdrant', 'pinecone'],
      models: {
        groqModel: aiConfig.GROQ_MODEL,
        geminiModel: aiConfig.GEMINI_MODEL,
        ollamaModel: aiConfig.OLLAMA_MODEL,
        nomicEmbeddingModel: aiConfig.OLLAMA_EMBEDDING_MODEL,
      },
    };
  }

  public async processQuery(
    userId: string,
    prompt: string,
    workspaceId: string,
    projectId?: string,
    taskId?: string
  ) {
    const startTime = Date.now();
    await this.verifyWorkspaceAccess(userId, workspaceId);

    const graphState = await workflowGraph.execute(prompt, {
      workspaceId,
      projectId,
      taskId,
      userId,
      retrievedContext: [],
      toolsUsed: [],
    });

    const executionTimeMs = Date.now() - startTime;
    const providerMetrics = providerManager.getMetrics();

    logger.info(`🤖 [AIService] Processed query via [${providerMetrics.selectedProvider}] in ${executionTimeMs}ms`, {
      userId,
      workspaceId,
      tokens: graphState.tokensUsed,
      providerMetrics,
    });

    return {
      query: prompt,
      intent: graphState.intent,
      response: graphState.finalResponse,
      steps: graphState.stepHistory,
      toolsUsed: graphState.selectedTools,
      citations: graphState.context.citations || [],
      contextCount: graphState.context.retrievedContext.length,
      metrics: {
        executionTimeMs,
        tokens: graphState.tokensUsed,
        selectedProvider: providerMetrics.selectedProvider,
        fallbackCount: providerMetrics.fallbackCount,
        retryCount: providerMetrics.retryCount,
        providerLatencyMs: providerMetrics.latencyMs,
      },
    };
  }

  public async streamQuery(
    userId: string,
    prompt: string,
    workspaceId: string,
    onChunk: (chunk: LLMStreamChunk) => void,
    projectId?: string,
    taskId?: string
  ) {
    await this.verifyWorkspaceAccess(userId, workspaceId);

    return providerManager.stream(
      {
        prompt,
        options: {
          systemPrompt: `Workspace Context (ID: ${workspaceId}, Project: ${projectId || 'N/A'}, Task: ${taskId || 'N/A'})`,
        },
      },
      onChunk
    );
  }

  public async testEmbedding(text: string) {
    const start = Date.now();
    const vector = await nomicEmbeddingProvider.embedQuery(text);
    return {
      dimensions: vector.length,
      sampleVector: vector.slice(0, 5),
      latencyMs: Date.now() - start,
      provider: nomicEmbeddingProvider.name,
      model: aiConfig.OLLAMA_EMBEDDING_MODEL,
    };
  }
}

export const aiService = new AIService();
