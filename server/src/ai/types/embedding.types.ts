export interface EmbeddingProviderHealthStatus {
  provider: string;
  status: 'healthy' | 'unhealthy' | 'unconfigured';
  dimensions?: number;
  message?: string;
}

export interface EmbeddingProvider {
  name: string;
  dimensions: number;
  embedQuery(text: string): Promise<number[]>;
  embedDocuments(documents: string[]): Promise<number[][]>;
  health(): Promise<EmbeddingProviderHealthStatus>;
}
