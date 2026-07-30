import { Request, Response, NextFunction } from 'express';
import { aiHealthService } from '../health/aiHealth.service.js';
import { providerRegistry } from '../registries/provider.registry.js';
import { promptRegistry } from '../registries/prompt.registry.js';
import { plannerRegistry } from '../registries/planner.registry.js';
import { toolRegistry } from '../registries/tool.registry.js';
import { aiAuditService } from '../audit/aiAudit.service.js';
import { aiConfigService } from '../config/aiConfig.service.js';
import { aiDiagnosticsService } from '../diagnostics/aiDiagnostics.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';

export class AICoreAdminController {
  public getHealth = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const health = await aiHealthService.getHealth();
      return ApiResponse.success({ res, data: health });
    } catch (err) {
      return next(err);
    }
  };

  public getProviders = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const providers = providerRegistry.list();
      return ApiResponse.success({ res, data: providers });
    } catch (err) {
      return next(err);
    }
  };

  public getMetrics = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const diagnostics = await aiDiagnosticsService.runDiagnostics();
      return ApiResponse.success({ res, data: diagnostics });
    } catch (err) {
      return next(err);
    }
  };

  public getAudit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.query.workspaceId as string | undefined;
      const audits = await aiAuditService.getRecentAudits(workspaceId);
      return ApiResponse.success({ res, data: audits });
    } catch (err) {
      return next(err);
    }
  };

  public getPrompts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const prompts = promptRegistry.list();
      return ApiResponse.success({ res, data: prompts });
    } catch (err) {
      return next(err);
    }
  };

  public getPlanners = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const planners = plannerRegistry.list();
      return ApiResponse.success({ res, data: planners });
    } catch (err) {
      return next(err);
    }
  };

  public getTools = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const tools = toolRegistry.list();
      return ApiResponse.success({ res, data: tools });
    } catch (err) {
      return next(err);
    }
  };

  public getConfig = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const config = aiConfigService.getConfig();
      return ApiResponse.success({ res, data: config });
    } catch (err) {
      return next(err);
    }
  };
}

export const aiCoreAdminController = new AICoreAdminController();
