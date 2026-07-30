import { TaskExecutionPlan } from '../planner/task.planner.js';
import { providerManager } from '../providers/provider.manager.js';
import { hybridRetriever } from '../retrievers/hybrid.retriever.js';
import { getTaskContextTool, summarizeDiscussionTool } from '../tools/taskAssistant.tools.js';
import { taskValidator } from '../validators/task.validator.js';
import { logger } from '../../utils/logger.js';
import { LLMStreamChunk } from '../types/provider.types.js';

export class TaskExecutor {
  public async executePlan(plan: TaskExecutionPlan) {
    const startTime = Date.now();
    logger.info(`⚡ [TaskExecutor] Executing action: ${plan.action} for task: ${plan.taskId}`);

    const contextData = await getTaskContextTool(plan.taskId);
    if (!contextData || !contextData.task) {
      throw new Error(`Task #${plan.taskId} not found`);
    }

    const { task } = contextData;
    let extraContext = '';

    if (plan.action === 'SUMMARIZE_DISCUSSION') {
      extraContext = await summarizeDiscussionTool(plan.taskId);
    } else {
      const hybrid = await hybridRetriever.search(plan.workspaceId, `${task.title} ${task.description || ''}`, 5);
      extraContext = hybrid.contextBlock;
    }

    const prompt = plan.promptTemplate(task.title, task.description || '', extraContext);

    const llmOutput = await providerManager.generate({
      prompt,
      options: {
        systemPrompt: plan.systemInstruction,
      },
    });

    const validation = taskValidator.validate(plan.action, llmOutput.text);

    return {
      action: plan.action,
      taskId: plan.taskId,
      result: validation.sanitizedContent,
      isValid: validation.isValid,
      metrics: {
        executionTimeMs: Date.now() - startTime,
        provider: llmOutput.provider,
        tokens: {
          prompt: llmOutput.promptTokens,
          completion: llmOutput.completionTokens,
          total: llmOutput.totalTokens,
        },
      },
    };
  }

  public async streamPlan(
    plan: TaskExecutionPlan,
    onChunk: (chunk: LLMStreamChunk) => void
  ) {
    const contextData = await getTaskContextTool(plan.taskId);
    if (!contextData || !contextData.task) {
      throw new Error(`Task #${plan.taskId} not found`);
    }

    const { task } = contextData;
    let extraContext = '';

    if (plan.action === 'SUMMARIZE_DISCUSSION') {
      extraContext = await summarizeDiscussionTool(plan.taskId);
    } else {
      const hybrid = await hybridRetriever.search(plan.workspaceId, `${task.title} ${task.description || ''}`, 5);
      extraContext = hybrid.contextBlock;
    }

    const prompt = plan.promptTemplate(task.title, task.description || '', extraContext);

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

export const taskExecutor = new TaskExecutor();
