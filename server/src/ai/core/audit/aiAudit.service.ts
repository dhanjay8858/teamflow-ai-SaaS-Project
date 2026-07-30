import { AIAuditLogModel } from './aiAudit.model.js';
import { logger } from '../../../utils/logger.js';

export interface RecordAuditParams {
  userId: string;
  workspaceId: string;
  planner: string;
  provider: string;
  promptVersion?: string;
  toolChain?: string[];
  retrievers?: string[];
  latencyMs: number;
  tokens: { prompt: number; completion: number; total: number };
  fallbackOccurred?: boolean;
  citationsCount?: number;
  requestId?: string;
}

export class AIAuditService {
  public async record(params: RecordAuditParams): Promise<void> {
    try {
      const estimatedCost = (params.tokens.prompt * 0.0000005) + (params.tokens.completion * 0.0000015);

      await AIAuditLogModel.create({
        userId: params.userId,
        workspaceId: params.workspaceId,
        planner: params.planner,
        provider: params.provider,
        promptVersion: params.promptVersion || '1.0.0',
        toolChain: params.toolChain || [],
        retrievers: params.retrievers || [],
        latencyMs: params.latencyMs,
        tokenUsage: params.tokens,
        estimatedCost,
        fallbackOccurred: params.fallbackOccurred || false,
        citationsCount: params.citationsCount || 0,
        requestId: params.requestId,
      });

      logger.debug(`📝 [AIAuditService] Recorded audit entry for user ${params.userId} in workspace ${params.workspaceId}`);
    } catch (err: any) {
      logger.warn(`⚠️ [AIAuditService] Record audit error: ${err?.message || String(err)}`);
    }
  }

  public async getRecentAudits(workspaceId?: string, limit = 50) {
    const filter: Record<string, unknown> = {};
    if (workspaceId) filter.workspaceId = workspaceId;
    return AIAuditLogModel.find(filter).sort({ createdAt: -1 }).limit(limit).exec();
  }
}

export const aiAuditService = new AIAuditService();
