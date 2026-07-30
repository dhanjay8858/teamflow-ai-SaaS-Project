import { Request, Response, NextFunction } from 'express';
import { activityService, ActivityService } from '../services/activity.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';
import { DomainEventType, ActivityEntityType } from '../types/activity.types.js';

export class ActivityController {
  constructor(private service: ActivityService = activityService) {}

  public getWorkspaceTimeline = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const workspaceId = req.params.workspaceId || (req.query.workspaceId as string);
      if (!workspaceId) throw AppError.badRequest('workspaceId parameter is required');

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const eventType = req.query.eventType as DomainEventType | undefined;
      const entityType = req.query.entityType as ActivityEntityType | undefined;

      const result = await this.service.getWorkspaceTimeline(workspaceId, {
        page,
        limit,
        eventType,
        entityType,
      });

      return ApiResponse.success({
        res,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  };

  public getOrganizationTimeline = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const organizationId = req.params.organizationId || (req.query.organizationId as string);
      if (!organizationId) throw AppError.badRequest('organizationId parameter is required');

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const eventType = req.query.eventType as DomainEventType | undefined;
      const entityType = req.query.entityType as ActivityEntityType | undefined;

      const result = await this.service.getOrganizationTimeline(organizationId, {
        page,
        limit,
        eventType,
        entityType,
      });

      return ApiResponse.success({
        res,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const activityController = new ActivityController();
