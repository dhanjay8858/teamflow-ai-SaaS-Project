import { projectPlanner, ProjectAiAction } from '../planners/project.planner.js';
import { getProjectContextTool } from '../tools/projectIntelligence.tools.js';
import { providerManager } from '../../providers/provider.manager.js';
import { membershipRepository, MembershipRepository } from '../../../repositories/membership.repository.js';
import { AppError } from '../../../utils/appError.js';
import { LLMStreamChunk } from '../../types/provider.types.js';
import { logger } from '../../../utils/logger.js';

export class ProjectIntelligenceService {
  constructor(private wsMemberRepo: MembershipRepository = membershipRepository) {}

  private async verifyWorkspaceAccess(userId: string, workspaceId: string): Promise<void> {
    const membership = await this.wsMemberRepo.findByUserAndWorkspace(userId, workspaceId);
    if (!membership) {
      throw AppError.forbidden('You are not a member of this workspace');
    }
  }

  public async executeAction(
    userId: string,
    workspaceId: string,
    projectId: string,
    action: ProjectAiAction,
    reportType = 'Weekly'
  ) {
    const startTime = Date.now();
    await this.verifyWorkspaceAccess(userId, workspaceId);

    const plan = projectPlanner.createPlan(action, projectId, workspaceId, reportType);
    const contextData = await getProjectContextTool(projectId, workspaceId);
    if (!contextData || !contextData.project) {
      throw new Error(`Project #${projectId} not found`);
    }

    const { project, taskSummary, hybridContextBlock } = contextData;
    const combinedContext = `Task Status Summary:\n${taskSummary}\n\nHybrid Search Context:\n${hybridContextBlock}`;
    const prompt = plan.promptTemplate(project.name, combinedContext);

    const llmOutput = await providerManager.generate({
      prompt,
      options: {
        systemPrompt: plan.systemInstruction,
      },
    });

    const executionTimeMs = Date.now() - startTime;
    logger.info(`✨ [ProjectIntelligenceService] Executed ${action} in ${executionTimeMs}ms`);

    return {
      action,
      projectId,
      result: llmOutput.text,
      metrics: {
        executionTimeMs,
        provider: llmOutput.provider,
        tokens: {
          prompt: llmOutput.promptTokens,
          completion: llmOutput.completionTokens,
          total: llmOutput.totalTokens,
        },
      },
    };
  }

  public async streamAction(
    userId: string,
    workspaceId: string,
    projectId: string,
    action: ProjectAiAction,
    onChunk: (chunk: LLMStreamChunk) => void,
    reportType = 'Weekly'
  ) {
    await this.verifyWorkspaceAccess(userId, workspaceId);

    const plan = projectPlanner.createPlan(action, projectId, workspaceId, reportType);
    const contextData = await getProjectContextTool(projectId, workspaceId);
    if (!contextData || !contextData.project) {
      throw new Error(`Project #${projectId} not found`);
    }

    const { project, taskSummary, hybridContextBlock } = contextData;
    const combinedContext = `Task Status Summary:\n${taskSummary}\n\nHybrid Search Context:\n${hybridContextBlock}`;
    const prompt = plan.promptTemplate(project.name, combinedContext);

    return providerManager.stream(
      {
        prompt,
        options: {
          systemPrompt: plan.systemInstruction,
        },
      },
      onChunk
    );
  }
}

export const projectIntelligenceService = new ProjectIntelligenceService();
