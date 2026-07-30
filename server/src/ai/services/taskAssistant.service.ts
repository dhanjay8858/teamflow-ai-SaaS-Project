import { taskPlanner, TaskActionType } from '../planner/task.planner.js';
import { taskExecutor } from '../executor/task.executor.js';
import { membershipRepository, MembershipRepository } from '../../repositories/membership.repository.js';
import { AppError } from '../../utils/appError.js';
import { LLMStreamChunk } from '../types/provider.types.js';

export class TaskAssistantService {
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
    taskId: string,
    action: TaskActionType
  ) {
    await this.verifyWorkspaceAccess(userId, workspaceId);
    const plan = taskPlanner.createPlan(action, taskId, workspaceId);
    return taskExecutor.executePlan(plan);
  }

  public async streamAction(
    userId: string,
    workspaceId: string,
    taskId: string,
    action: TaskActionType,
    onChunk: (chunk: LLMStreamChunk) => void
  ) {
    await this.verifyWorkspaceAccess(userId, workspaceId);
    const plan = taskPlanner.createPlan(action, taskId, workspaceId);
    return taskExecutor.streamPlan(plan, onChunk);
  }
}

export const taskAssistantService = new TaskAssistantService();
