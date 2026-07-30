import { Request, Response, NextFunction } from 'express';
import { workspaceContextService, WorkspaceContextService } from '../services/context.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export class WorkspaceContextController {
  constructor(private service: WorkspaceContextService = workspaceContextService) {}

  public getCurrentContext = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const context = await this.service.getCurrentContext(req.user.userId);
      return ApiResponse.success({
        res,
        data: context,
      });
    } catch (error) {
      return next(error);
    }
  };

  public switchWorkspace = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const context = await this.service.switchWorkspaceContext(req.user.userId, req.body);
      return ApiResponse.success({
        res,
        message: 'Active workspace context updated successfully',
        data: context,
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const workspaceContextController = new WorkspaceContextController();
