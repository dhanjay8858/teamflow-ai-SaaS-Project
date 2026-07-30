import { AgentExecutionGoal } from '../types/agent.types.js';
import { agentOrchestrator } from '../orchestrator/agent.orchestrator.js';

export class ScrumMasterAgent {
  public async execute(goal: AgentExecutionGoal) {
    return agentOrchestrator.executeSingleAgent({ ...goal, agentId: 'scrum-master-agent' });
  }
}

export class ProjectManagerAgent {
  public async execute(goal: AgentExecutionGoal) {
    return agentOrchestrator.executeSingleAgent({ ...goal, agentId: 'project-manager-agent' });
  }
}

export class QAAgent {
  public async execute(goal: AgentExecutionGoal) {
    return agentOrchestrator.executeSingleAgent({ ...goal, agentId: 'qa-agent' });
  }
}

export class TechnicalWriterAgent {
  public async execute(goal: AgentExecutionGoal) {
    return agentOrchestrator.executeSingleAgent({ ...goal, agentId: 'technical-writer-agent' });
  }
}

export class ReleaseManagerAgent {
  public async execute(goal: AgentExecutionGoal) {
    return agentOrchestrator.executeSingleAgent({ ...goal, agentId: 'release-manager-agent' });
  }
}

export class KnowledgeAgent {
  public async execute(goal: AgentExecutionGoal) {
    return agentOrchestrator.executeSingleAgent({ ...goal, agentId: 'knowledge-agent' });
  }
}

export const scrumMasterAgent = new ScrumMasterAgent();
export const projectManagerAgent = new ProjectManagerAgent();
export const qaAgent = new QAAgent();
export const technicalWriterAgent = new TechnicalWriterAgent();
export const releaseManagerAgent = new ReleaseManagerAgent();
export const knowledgeAgent = new KnowledgeAgent();
