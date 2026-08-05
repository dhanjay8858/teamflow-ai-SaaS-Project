import { Request, Response, NextFunction } from 'express';
import { workspaceInvitationService, WorkspaceInvitationService } from '../services/invitation.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

import { env } from '../config/env.config.js';

export class WorkspaceInvitationController {
  constructor(private service: WorkspaceInvitationService = workspaceInvitationService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const { invitation, rawToken } = await this.service.createInvitation(req.user.userId, req.body);
      return ApiResponse.created({
        res,
        message: 'Workspace invitation created successfully',
        data: {
          invitation,
          invitationLink: `${env.CLIENT_URL}/invitations/accept?token=${rawToken}`,
          token: rawToken,
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  public getWorkspacePendingInvitations = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const workspaceId = (req.query.workspaceId || req.params.workspaceId) as string;
      if (!workspaceId) throw AppError.badRequest('workspaceId parameter is required');

      const invitations = await this.service.getWorkspacePendingInvitations(workspaceId);
      return ApiResponse.success({
        res,
        data: { invitations },
      });
    } catch (error) {
      return next(error);
    }
  };

  public validateToken = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const invitation = await this.service.validateInvitationToken(req.params.token);
      return ApiResponse.success({
        res,
        message: 'Invitation token is valid',
        data: { invitation },
      });
    } catch (error) {
      return next(error);
    }
  };

  public accept = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const { organizationSlug, workspaceSlug } = await this.service.acceptInvitation(req.params.token, req.user.userId);
      return ApiResponse.success({
        res,
        message: 'Invitation accepted successfully. Workspace membership activated.',
        data: { organizationSlug, workspaceSlug },
      });
    } catch (error) {
      return next(error);
    }
  };

  public decline = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      await this.service.declineInvitation(req.params.token);
      return ApiResponse.success({
        res,
        message: 'Invitation declined.',
      });
    } catch (error) {
      return next(error);
    }
  };

  public cancel = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      await this.service.cancelInvitation(req.params.id);
      return ApiResponse.success({
        res,
        message: 'Invitation cancelled successfully.',
      });
    } catch (error) {
      return next(error);
    }
  };

  public resend = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { invitation, rawToken } = await this.service.resendInvitation(req.params.id);
      return ApiResponse.success({
        res,
        message: 'Invitation resent successfully.',
        data: {
          invitation,
          token: rawToken,
        },
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const workspaceInvitationController = new WorkspaceInvitationController();
