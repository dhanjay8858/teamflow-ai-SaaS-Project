import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { membershipRepository } from '../repositories/membership.repository.js';
import { workspaceRepository } from '../repositories/workspace.repository.js';
import { IMembershipDocument, IWorkspaceDocument, MembershipRole } from '../types/organization.types.js';

declare global {
  namespace Express {
    interface Request {
      workspace?: IWorkspaceDocument;
      membership?: IMembershipDocument;
    }
  }
}

export const requireWorkspaceContext = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(AppError.unauthorized('Authentication required'));
    }

    const workspaceId = (
      req.headers['x-workspace-id'] ||
      req.params.workspaceId ||
      req.query.workspaceId
    ) as string | undefined;

    if (!workspaceId) {
      return next(AppError.badRequest('Workspace context missing (Provide x-workspace-id header or workspaceId param)'));
    }

    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace || workspace.isArchived) {
      return next(AppError.notFound('Workspace not found'));
    }

    const membership = await membershipRepository.findByUserAndWorkspace(userId, workspaceId);
    if (!membership) {
      return next(AppError.forbidden('You are not an active member of this workspace'));
    }

    req.workspace = workspace;
    req.membership = membership;
    return next();
  } catch (error) {
    return next(error as Error);
  }
};

export const requireWorkspaceRole = (...allowedRoles: MembershipRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.membership) {
      return next(AppError.forbidden('Workspace context not initialized'));
    }

    if (!allowedRoles.includes(req.membership.role)) {
      return next(AppError.forbidden(`Requires workspace role: ${allowedRoles.join(' or ')}`));
    }

    return next();
  };
};
