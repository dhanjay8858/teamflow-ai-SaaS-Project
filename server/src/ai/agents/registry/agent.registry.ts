import { AgentMetadata } from '../types/agent.types.js';

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents = new Map<string, AgentMetadata>();

  private constructor() {
    this.seedDefaultAgents();
  }

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  public register(meta: AgentMetadata): void {
    this.agents.set(meta.id, meta);
  }

  public unregister(id: string): boolean {
    return this.agents.delete(id);
  }

  public get(id: string): AgentMetadata | undefined {
    return this.agents.get(id);
  }

  public exists(id: string): boolean {
    return this.agents.has(id);
  }

  public list(): AgentMetadata[] {
    return Array.from(this.agents.values()).filter((a) => a.enabled);
  }

  private seedDefaultAgents(): void {
    this.register({
      id: 'scrum-master-agent',
      name: 'ScrumMaster Agent',
      description: 'Sprint planning, velocity analysis, retrospective, standup summaries',
      category: 'SCRUM_MASTER',
      permissions: ['workspace:read', 'task:read', 'project:read'],
      supportedGoals: ['sprint-planning', 'velocity-analysis', 'standup-summary', 'retrospective'],
      version: '1.0.0',
      enabled: true,
    });

    this.register({
      id: 'project-manager-agent',
      name: 'ProjectManager Agent',
      description: 'Milestone tracking, prioritization, deadline risk assessment, and roadmap planning',
      category: 'PROJECT_MANAGER',
      permissions: ['workspace:read', 'project:read', 'task:read'],
      supportedGoals: ['prioritization', 'roadmap-planning', 'project-risks'],
      version: '1.0.0',
      enabled: true,
    });

    this.register({
      id: 'qa-agent',
      name: 'QA Engineer Agent',
      description: 'Test case generation, acceptance criteria review, and regression checklists',
      category: 'QA_ENGINEER',
      permissions: ['workspace:read', 'task:read'],
      supportedGoals: ['test-case-generation', 'acceptance-review', 'regression-checklist'],
      version: '1.0.0',
      enabled: true,
    });

    this.register({
      id: 'technical-writer-agent',
      name: 'TechnicalWriter Agent',
      description: 'Release notes, architecture documentation, meeting notes, and API specs',
      category: 'TECHNICAL_WRITER',
      permissions: ['workspace:read', 'file:read', 'comment:read'],
      supportedGoals: ['release-notes', 'architecture-summary', 'api-docs'],
      version: '1.0.0',
      enabled: true,
    });

    this.register({
      id: 'release-manager-agent',
      name: 'ReleaseManager Agent',
      description: 'Release readiness checklist, rollback strategy, deployment validation',
      category: 'RELEASE_MANAGER',
      permissions: ['workspace:read', 'project:read'],
      supportedGoals: ['release-readiness', 'rollback-strategy', 'deployment-checklist'],
      version: '1.0.0',
      enabled: true,
    });

    this.register({
      id: 'knowledge-agent',
      name: 'Knowledge Agent',
      description: 'Workspace semantic search, cross-project discovery, architecture answers',
      category: 'KNOWLEDGE_ENGINEER',
      permissions: ['workspace:read'],
      supportedGoals: ['workspace-search', 'cross-project-discovery', 'explain-architecture'],
      version: '1.0.0',
      enabled: true,
    });
  }
}

export const agentRegistry = AgentRegistry.getInstance();
