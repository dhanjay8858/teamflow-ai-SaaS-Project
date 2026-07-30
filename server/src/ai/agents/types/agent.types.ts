export type AgentCategory =
  | 'SCRUM_MASTER'
  | 'PROJECT_MANAGER'
  | 'QA_ENGINEER'
  | 'TECHNICAL_WRITER'
  | 'RELEASE_MANAGER'
  | 'KNOWLEDGE_ENGINEER';

export type AgentApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';

export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  permissions: string[];
  supportedGoals: string[];
  version: string;
  enabled: boolean;
}

export interface AgentExecutionGoal {
  goal: string;
  agentId: string;
  workspaceId: string;
  projectId?: string;
  taskId?: string;
  requireApproval?: boolean;
  delegations?: string[];
}

export interface AgentReflection {
  confidenceScore: number;
  goalAchieved: boolean;
  missingContext: boolean;
  toolFailures: string[];
  recommendations: string[];
  reflectionSummary: string;
}

export interface AgentExecutionResult {
  executionId: string;
  agentId: string;
  goal: string;
  status: 'COMPLETED' | 'PENDING_APPROVAL' | 'FAILED' | 'REJECTED';
  plan?: string;
  output?: string;
  reflection?: AgentReflection;
  metrics: {
    totalDurationMs: number;
    plannerTimeMs: number;
    retrieverTimeMs: number;
    executionTimeMs: number;
    reflectionTimeMs: number;
    tokensUsed: number;
  };
  delegationGraph?: string[];
}
