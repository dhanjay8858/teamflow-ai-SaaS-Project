import { Request, Response, NextFunction } from 'express';
import { workspaceService, WorkspaceService } from '../services/workspace.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export class WorkspaceController {
  constructor(private service: WorkspaceService = workspaceService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const workspace = await this.service.createWorkspace(req.user.userId, req.body);
      return ApiResponse.created({
        res,
        message: 'Workspace created successfully',
        data: { workspace },
      });
    } catch (error) {
      return next(error);
    }
  };

  public getOrgWorkspaces = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const orgId = (req.query.organizationId || req.params.orgId) as string;
      if (!orgId) throw AppError.badRequest('organizationId query parameter is required');

      const workspaces = await this.service.getOrgWorkspaces(req.user.userId, orgId);
      return ApiResponse.success({
        res,
        data: { workspaces },
      });
    } catch (error) {
      return next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const workspace = await this.service.getWorkspaceById(req.params.id);
      return ApiResponse.success({
        res,
        data: { workspace },
      });
    } catch (error) {
      return next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const workspace = await this.service.updateWorkspace(req.params.id, req.body);
      return ApiResponse.success({
        res,
        message: 'Workspace updated successfully',
        data: { workspace },
      });
    } catch (error) {
      return next(error);
    }
  };

  public archive = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      await this.service.archiveWorkspace(req.params.id);
      return ApiResponse.success({
        res,
        message: 'Workspace archived successfully',
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const workspaceController = new WorkspaceController();
