import { Request, Response, NextFunction } from 'express';
import { membershipService, MembershipService } from '../services/membership.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export class MembershipController {
  constructor(private service: MembershipService = membershipService) {}

  public getWorkspaceMembers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const workspaceId = (req.query.workspaceId || req.params.workspaceId) as string;
      if (!workspaceId) throw AppError.badRequest('workspaceId parameter is required');

      const members = await this.service.getWorkspaceMembers(workspaceId);
      return ApiResponse.success({
        res,
        data: { members },
      });
    } catch (error) {
      return next(error);
    }
  };

  public getUserMemberships = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const memberships = await this.service.getUserMemberships(req.user.userId);
      return ApiResponse.success({
        res,
        data: { memberships },
      });
    } catch (error) {
      return next(error);
    }
  };

  public addMember = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { workspaceId, userId, role } = req.body;
      const membership = await this.service.addMember(workspaceId, userId, role);
      return ApiResponse.created({
        res,
        message: 'Member added successfully',
        data: { membership },
      });
    } catch (error) {
      return next(error);
    }
  };

  public updateRole = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const membership = await this.service.updateRole(req.user.userId, req.params.id, req.body.role);
      return ApiResponse.success({
        res,
        message: 'Member role updated successfully',
        data: { membership },
      });
    } catch (error) {
      return next(error);
    }
  };

  public removeMember = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      await this.service.removeMember(req.user.userId, req.params.id);
      return ApiResponse.success({
        res,
        message: 'Member removed successfully',
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const membershipController = new MembershipController();
