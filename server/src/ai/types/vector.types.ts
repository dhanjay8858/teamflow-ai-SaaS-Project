export interface VectorDocument {
  id: string;
  content: string;
  vector?: number[];
  metadata: Record<string, unknown>;
  workspaceId: string;
  projectId?: string;
  entityType: string;
  entityId: string;
  createdAt?: Date;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
  entityType: string;
  entityId: string;
}

export interface VectorStoreSearchFilter {
  workspaceId: string;
  projectId?: string;
  entityType?: string;
  limit?: number;
  minScore?: number;
}

export interface VectorStoreHealthStatus {
  store: string;
  status: 'healthy' | 'unhealthy' | 'unconfigured';
  message?: string;
}

export interface VectorStore {
  name: string;
  upsert(documents: VectorDocument[]): Promise<boolean>;
  delete(ids: string[]): Promise<boolean>;
  search(queryVector: number[], filter: VectorStoreSearchFilter): Promise<VectorSearchResult[]>;
  health(): Promise<VectorStoreHealthStatus>;
}
