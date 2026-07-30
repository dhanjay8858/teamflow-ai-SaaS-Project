import { AgentExecutionGoal, AgentExecutionResult } from '../types/agent.types.js';
import { agentRegistry } from '../registry/agent.registry.js';
import { agentOrchestrator } from '../orchestrator/agent.orchestrator.js';
import { membershipRepository, MembershipRepository } from '../../../repositories/membership.repository.js';
import { AppError } from '../../../utils/appError.js';
import { LLMStreamChunk } from '../../types/provider.types.js';
import { providerManager } from '../../providers/provider.manager.js';

export class AgentRuntime {
  constructor(private wsMemberRepo: MembershipRepository = membershipRepository) {}

  private async verifyWorkspaceAccess(userId: string, workspaceId: string): Promise<void> {
    const membership = await this.wsMemberRepo.findByUserAndWorkspace(userId, workspaceId);
    if (!membership) {
      throw AppError.forbidden('You are not a member of this workspace');
    }
  }

  public async run(userId: string, goal: AgentExecutionGoal): Promise<AgentExecutionResult> {
    await this.verifyWorkspaceAccess(userId, goal.workspaceId);

    const meta = agentRegistry.get(goal.goal.includes('multi') ? 'project-manager-agent' : goal.agentId);
    if (!meta) {
      throw AppError.notFound(`Agent [${goal.agentId}] not found in registry`);
    }

    if (goal.delegations && goal.delegations.length > 1) {
      return agentOrchestrator.executeMultiAgent(goal);
    }

    return agentOrchestrator.executeSingleAgent(goal);
  }

  public async runStream(
    userId: string,
    goal: AgentExecutionGoal,
    onChunk: (chunk: LLMStreamChunk) => void
  ) {
    await this.verifyWorkspaceAccess(userId, goal.workspaceId);

    const prompt = `Execute Goal: "${goal.goal}" for Agent: ${goal.agentId}`;
    return providerManager.stream(
      {
        prompt,
        options: {
          systemPrompt: `You are AI Agent [${goal.agentId}]. Stream response step by step.`,
        },
      },
      onChunk
    );
  }
}

export const agentRuntime = new AgentRuntime();
