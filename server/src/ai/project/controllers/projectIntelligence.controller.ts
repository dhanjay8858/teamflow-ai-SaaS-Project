import { Request, Response, NextFunction } from 'express';
import { projectIntelligenceService, ProjectIntelligenceService } from '../services/projectIntelligence.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { AppError } from '../../../utils/appError.js';

export class ProjectIntelligenceController {
  constructor(private service: ProjectIntelligenceService = projectIntelligenceService) {}

  public executeAction = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const { workspaceId, projectId, action, reportType } = req.body;
      if (!workspaceId || !projectId || !action) {
        throw AppError.badRequest('workspaceId, projectId, and action are required');
      }

      const result = await this.service.executeAction(req.user.userId, workspaceId, projectId, action, reportType);
      return ApiResponse.success({ res, message: `Project AI action ${action} executed`, data: result });
    } catch (error) {
      return next(error);
    }
  };

  public streamAction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const { workspaceId, projectId, action, reportType } = req.body;
      if (!workspaceId || !projectId || !action) {
        throw AppError.badRequest('workspaceId, projectId, and action are required');
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await this.service.streamAction(
        req.user.userId,
        workspaceId,
        projectId,
        action,
        (chunk) => {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        },
        reportType
      );

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      return next(error);
    }
  };
}

export const projectIntelligenceController = new ProjectIntelligenceController();
