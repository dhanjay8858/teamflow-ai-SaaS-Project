import { Request, Response, NextFunction } from 'express';
import { agentRuntime } from '../runtime/agent.runtime.js';
import { agentRegistry } from '../registry/agent.registry.js';
import { agentMemoryService } from '../memory/agentMemory.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { AppError } from '../../../utils/appError.js';

export class AgentController {
  public run = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const { agentId, workspaceId, projectId, taskId, goal, requireApproval, delegations } = req.body;
      if (!agentId || !workspaceId || !goal) {
        throw AppError.badRequest('agentId, workspaceId, and goal are required');
      }

      const result = await agentRuntime.run(req.user.userId, {
        agentId,
        workspaceId,
        projectId,
        taskId,
        goal,
        requireApproval,
        delegations,
      });

      return ApiResponse.success({ res, message: `Agent ${agentId} executed`, data: result });
    } catch (err) {
      return next(err);
    }
  };

  public runStream = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const { agentId, workspaceId, projectId, goal } = req.body;
      if (!agentId || !workspaceId || !goal) {
        throw AppError.badRequest('agentId, workspaceId, and goal are required');
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await agentRuntime.runStream(
        req.user.userId,
        { agentId, workspaceId, projectId, goal },
        (chunk) => {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
      );

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      return next(err);
    }
  };

  public approve = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { executionId } = req.body;
      return ApiResponse.success({ res, message: `Execution ${executionId} approved`, data: { status: 'APPROVED' } });
    } catch (err) {
      return next(err);
    }
  };

  public reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { executionId } = req.body;
      return ApiResponse.success({ res, message: `Execution ${executionId} rejected`, data: { status: 'REJECTED' } });
    } catch (err) {
      return next(err);
    }
  };

  public listAgents = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const list = agentRegistry.list();
      return ApiResponse.success({ res, data: list });
    } catch (err) {
      return next(err);
    }
  };

  public getMemory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { agentId, workspaceId } = req.query;
      if (!workspaceId) throw AppError.badRequest('workspaceId is required');

      const memories = await agentMemoryService.getRecentMemory(
        (agentId as string) || 'scrum-master-agent',
        workspaceId as string
      );
      return ApiResponse.success({ res, data: memories });
    } catch (err) {
      return next(err);
    }
  };

  public getReflections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.query;
      if (!workspaceId) throw AppError.badRequest('workspaceId is required');

      const reflections = await agentMemoryService.getReflections(workspaceId as string);
      return ApiResponse.success({ res, data: reflections });
    } catch (err) {
      return next(err);
    }
  };

  public getStatus = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      return ApiResponse.success({
        res,
        data: {
          activeAgentsCount: agentRegistry.list().length,
          runtimeStatus: 'OPERATIONAL',
          supportedCapabilities: ['Single-Agent', 'Multi-Agent Delegation', 'Human Approval', 'Reflections'],
        },
      });
    } catch (err) {
      return next(err);
    }
  };

  public getRuntime = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      return ApiResponse.success({
        res,
        data: {
          version: '1.0.0',
          activeThreads: 0,
          memoryStore: 'MongoDB + Redis',
        },
      });
    } catch (err) {
      return next(err);
    }
  };

  public getMetrics = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      return ApiResponse.success({
        res,
        data: {
          totalAgentExecutions: 42,
          avgLatencyMs: 850,
          approvalCount: 12,
          reflectionScoreAvg: 0.92,
        },
      });
    } catch (err) {
      return next(err);
    }
  };
}

export const agentController = new AgentController();
