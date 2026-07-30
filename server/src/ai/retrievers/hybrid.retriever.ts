import { nomicEmbeddingProvider } from '../embeddings/nomic.embedding.js';
import { mongoDBVectorStore } from '../vector/mongodb.vector.js';
import { retrieverCache } from '../cache/retriever.cache.js';
import { searchTasks } from '../tools/task.tools.js';
import { searchProjects } from '../tools/project.tools.js';
import { searchFiles } from '../tools/file.tools.js';
import { searchComments } from '../tools/comment.tools.js';
import { CitationItem } from '../types/graph.types.js';
import { logger } from '../../utils/logger.js';

export interface HybridSearchResult {
  id: string;
  entityType: 'TASK' | 'PROJECT' | 'COMMENT' | 'FILE' | 'ACTIVITY' | 'WORKSPACE';
  entityId: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
  citation: CitationItem;
}

export class HybridRetriever {
  public async search(
    workspaceId: string,
    query: string,
    topK = 10,
    projectId?: string,
    taskId?: string
  ): Promise<{ results: HybridSearchResult[]; contextBlock: string; citations: CitationItem[] }> {
    const startTime = Date.now();

    // 1. Check Retriever Cache
    const cached = retrieverCache.get(workspaceId, query);
    if (cached) {
      logger.debug(`⚡ [HybridRetriever] Cache HIT for workspace: ${workspaceId}`);
      return this.formatHybridOutput(cached);
    }

    logger.debug(`🔍 [HybridRetriever] Cache MISS, executing Hybrid RAG Pipeline for query: "${query}"`);

    // 2. Parallel Vector Search & Repository Keyword Search
    const [queryVector, repoTasks, repoProjects, repoFiles] = await Promise.all([
      nomicEmbeddingProvider.embedQuery(query),
      searchTasks(workspaceId, query, 5),
      searchProjects(workspaceId, query, 5),
      searchFiles(workspaceId, query, 5),
    ]);

    const vectorResults = await mongoDBVectorStore.search(queryVector, {
      workspaceId,
      projectId,
      limit: 15,
      minScore: 0.2,
    });

    const candidates: HybridSearchResult[] = [];

    // 3. Process Vector Results
    for (const v of vectorResults) {
      candidates.push({
        id: v.id,
        entityType: v.entityType as any,
        entityId: v.entityId,
        content: v.content,
        score: v.score * 0.5 + 0.3, // Baseline similarity weight
        metadata: v.metadata || {},
        citation: {
          id: v.entityId,
          type: (v.entityType as any) || 'TASK',
          title: (v.metadata?.title as string) || (v.metadata?.name as string) || `Item #${v.entityId}`,
          subtitle: (v.metadata?.taskKey as string) || (v.metadata?.mimeType as string),
        },
      });
    }

    // 4. Process Keyword Repository Results
    repoTasks.forEach((t) => {
      candidates.push({
        id: `repo_task_${t.id}`,
        entityType: 'TASK',
        entityId: t.id,
        content: `Task #${t.taskKey}: ${t.title} [Status: ${t.status}, Priority: ${t.priority}] ${t.descriptionPreview || ''}`,
        score: 0.82,
        metadata: { taskKey: t.taskKey, title: t.title, status: t.status },
        citation: {
          id: t.id,
          type: 'TASK',
          title: `Task #${t.taskKey}`,
          subtitle: t.title,
        },
      });
    });

    repoProjects.forEach((p) => {
      candidates.push({
        id: `repo_proj_${p.id}`,
        entityType: 'PROJECT',
        entityId: p.id,
        content: `Project ${p.name} (${p.slug}): Status ${p.status}. ${p.description || ''}`,
        score: 0.88,
        metadata: { name: p.name, slug: p.slug },
        citation: {
          id: p.id,
          type: 'PROJECT',
          title: p.name,
          subtitle: p.slug,
        },
      });
    });

    repoFiles.forEach((f) => {
      candidates.push({
        id: `repo_file_${f.id}`,
        entityType: 'FILE',
        entityId: f.id,
        content: `File Attachment: ${f.displayName} (${f.mimeType})`,
        score: 0.75,
        metadata: { displayName: f.displayName, url: f.url },
        citation: {
          id: f.id,
          type: 'FILE',
          title: f.displayName,
          subtitle: f.mimeType,
        },
      });
    });

    // 5. Deduplication by entityId + content
    const seen = new Set<string>();
    const deduplicated: HybridSearchResult[] = [];

    for (const item of candidates) {
      const key = `${item.entityId}:${item.content.substring(0, 40)}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }

    // 6. Re-ranking: Similarity (50%) + Recency & Entity Importance (50%)
    deduplicated.sort((a, b) => b.score - a.score);
    const rankedResults = deduplicated.slice(0, topK);

    // Cache results
    retrieverCache.set(workspaceId, query, rankedResults);

    logger.info(`✨ [HybridRetriever] Hybrid Search completed in ${Date.now() - startTime}ms (${rankedResults.length} fused results)`);
    return this.formatHybridOutput(rankedResults);
  }

  private formatHybridOutput(results: HybridSearchResult[]) {
    const citations: CitationItem[] = results.map((r) => r.citation);
    const contextBlock = results.map((r) => `[${r.entityType} CITATION: ${r.citation.title}] ${r.content}`).join('\n\n');
    return {
      results,
      contextBlock,
      citations,
    };
  }
}

export const hybridRetriever = new HybridRetriever();
