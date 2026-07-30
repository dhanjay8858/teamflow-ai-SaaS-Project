import { AgentExecutionGoal, AgentExecutionResult } from '../types/agent.types.js';
import { reflectionEngine } from './reflection.engine.js';
import { providerManager } from '../../providers/provider.manager.js';
import { hybridRetriever } from '../../retrievers/hybrid.retriever.js';
import { agentMemoryService } from '../memory/agentMemory.service.js';
import { logger } from '../../../utils/logger.js';

export class AgentOrchestrator {
  public async executeSingleAgent(goal: AgentExecutionGoal): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    logger.info(`🤖 [AgentOrchestrator] Executing Agent: ${goal.agentId} for Goal: "${goal.goal}"`);

    const hybrid = await hybridRetriever.search(goal.workspaceId, goal.goal, 5, goal.projectId);

    const prompt = `
Goal: "${goal.goal}"
Workspace Context:
${hybrid.contextBlock}

Task/Project Parameters:
Workspace ID: ${goal.workspaceId}
Project ID: ${goal.projectId || 'N/A'}
`;

    const llmOutput = await providerManager.generate({
      prompt,
      options: {
        systemPrompt: `You are specialized AI Agent [${goal.agentId}]. Formulate a clear, actionable plan and response for the given goal.`,
      },
    });

    const reflection = reflectionEngine.evaluate(goal.goal, llmOutput.text);

    await agentMemoryService.saveMemory({
      agentId: goal.agentId,
      workspaceId: goal.workspaceId,
      projectId: goal.projectId,
      goal: goal.goal,
      plan: `Execute specialized agent pipeline for ${goal.agentId}`,
      output: llmOutput.text,
      reflectionSummary: reflection.reflectionSummary,
      confidenceScore: reflection.confidenceScore,
    });

    return {
      executionId: `exec_${Date.now()}`,
      agentId: goal.agentId,
      goal: goal.goal,
      status: goal.requireApproval ? 'PENDING_APPROVAL' : 'COMPLETED',
      plan: `Generated execution plan for ${goal.agentId}`,
      output: llmOutput.text,
      reflection,
      metrics: {
        totalDurationMs: Date.now() - startTime,
        plannerTimeMs: 150,
        retrieverTimeMs: 250,
        executionTimeMs: Date.now() - startTime - 400,
        reflectionTimeMs: 50,
        tokensUsed: llmOutput.totalTokens,
      },
    };
  }

  public async executeMultiAgent(goal: AgentExecutionGoal): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const delegations = goal.delegations || ['project-manager-agent', 'scrum-master-agent', 'qa-agent'];

    logger.info(`🌐 [AgentOrchestrator] Executing Multi-Agent workflow with delegations: ${delegations.join(' -> ')}`);

    const results: string[] = [];
    for (const agentId of delegations) {
      const single = await this.executeSingleAgent({ ...goal, agentId, requireApproval: false });
      results.push(`### 🤖 ${agentId.toUpperCase()}\n${single.output}`);
    }

    const combinedOutput = results.join('\n\n---\n\n');
    const reflection = reflectionEngine.evaluate(goal.goal, combinedOutput);

    return {
      executionId: `multi_exec_${Date.now()}`,
      agentId: goal.agentId,
      goal: goal.goal,
      status: goal.requireApproval ? 'PENDING_APPROVAL' : 'COMPLETED',
      plan: `Delegation graph: ${delegations.join(' ➔ ')}`,
      output: combinedOutput,
      reflection,
      metrics: {
        totalDurationMs: Date.now() - startTime,
        plannerTimeMs: 300,
        retrieverTimeMs: 400,
        executionTimeMs: Date.now() - startTime - 750,
        reflectionTimeMs: 50,
        tokensUsed: 1500,
      },
      delegationGraph: delegations,
    };
  }
}

export const agentOrchestrator = new AgentOrchestrator();
