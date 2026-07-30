export enum IntentType {
  SEARCH_TASKS = 'SEARCH_TASKS',
  SEARCH_PROJECTS = 'SEARCH_PROJECTS',
  SEARCH_COMMENTS = 'SEARCH_COMMENTS',
  SEARCH_FILES = 'SEARCH_FILES',
  SEARCH_ACTIVITIES = 'SEARCH_ACTIVITIES',
  SEARCH_NOTIFICATIONS = 'SEARCH_NOTIFICATIONS',
  SUMMARIZE = 'SUMMARIZE',
  GENERAL_QUERY = 'GENERAL_QUERY',
  UNKNOWN = 'UNKNOWN',
}

export interface CitationItem {
  id: string;
  type: 'TASK' | 'PROJECT' | 'COMMENT' | 'FILE' | 'ACTIVITY';
  title: string;
  subtitle?: string;
}

export interface GraphContextData {
  workspaceId: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  retrievedContext: string[];
  toolsUsed: string[];
  citations?: CitationItem[];
}

export interface GraphState {
  input: string;
  intent: IntentType;
  context: GraphContextData;
  selectedTools: string[];
  toolResults: Record<string, unknown>;
  generationText: string;
  finalResponse: string;
  stepHistory: string[];
  error?: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export type GraphNodeHandler = (state: GraphState) => Promise<Partial<GraphState>>;
