import { HybridSearchResult } from '../retrievers/hybrid.retriever.js';

export class RetrieverCacheManager {
  private cache = new Map<string, { data: HybridSearchResult[]; expiresAt: number }>();
  private readonly defaultTtlMs = 5 * 60 * 1000; // 5 minutes

  public get(workspaceId: string, query: string): HybridSearchResult[] | null {
    const key = `${workspaceId}:${query.toLowerCase().trim()}`;
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  public set(workspaceId: string, query: string, data: HybridSearchResult[], ttlMs = this.defaultTtlMs): void {
    const key = `${workspaceId}:${query.toLowerCase().trim()}`;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public clear(): void {
    this.cache.clear();
  }

  public clearWorkspace(workspaceId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${workspaceId}:`)) {
        this.cache.delete(key);
      }
    }
  }
}

export const retrieverCache = new RetrieverCacheManager();
