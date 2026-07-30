export interface CitationItem {
  id: string;
  type: 'TASK' | 'PROJECT' | 'COMMENT' | 'FILE' | 'ACTIVITY';
  title: string;
  subtitle?: string;
}

export interface AIMetrics {
  executionTimeMs: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  selectedProvider: string;
  fallbackCount?: number;
  retryCount?: number;
  providerLatencyMs?: number;
}

export interface AIQueryResponse {
  query: string;
  intent: string;
  response: string;
  steps: string[];
  toolsUsed: string[];
  citations: CitationItem[];
  contextCount: number;
  metrics: AIMetrics;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  citations?: CitationItem[];
  metrics?: AIMetrics;
  error?: string;
}

export interface AIConversation {
  id: string;
  workspaceId: string;
  title: string;
  createdAt: string;
  messages: AIChatMessage[];
}
