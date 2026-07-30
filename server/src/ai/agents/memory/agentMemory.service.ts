import { AgentMemoryModel } from './agentMemory.model.js';
import { logger } from '../../../utils/logger.js';

export class AgentMemoryService {
  public async saveMemory(params: {
    agentId: string;
    workspaceId: string;
    projectId?: string;
    goal: string;
    plan: string;
    output: string;
    reflectionSummary?: string;
    confidenceScore?: number;
  }) {
    try {
      return await AgentMemoryModel.create(params);
    } catch (err: any) {
      logger.warn(`⚠️ [AgentMemoryService] Failed to save memory: ${err?.message || String(err)}`);
      return null;
    }
  }

  public async getRecentMemory(agentId: string, workspaceId: string, limit = 10) {
    return AgentMemoryModel.find({ agentId, workspaceId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  public async getReflections(workspaceId: string, limit = 20) {
    return AgentMemoryModel.find({ workspaceId, reflectionSummary: { $exists: true, $ne: '' } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}

export const agentMemoryService = new AgentMemoryService();
