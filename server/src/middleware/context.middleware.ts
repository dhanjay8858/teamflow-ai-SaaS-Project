import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { organizationRepository } from '../repositories/organization.repository.js';
import { workspaceRepository } from '../repositories/workspace.repository.js';
import { membershipRepository } from '../repositories/membership.repository.js';
import { IOrganizationDocument } from '../types/organization.types.js';

declare global {
  namespace Express {
    interface Request {
      organization?: IOrganizationDocument;
    }
  }
}

export const resolveOrganizationAndWorkspace = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next(AppError.unauthorized());

    const orgSlug = (req.params.organizationSlug || req.headers['x-organization-slug']) as string | undefined;
    const wsSlug = (req.params.workspaceSlug || req.headers['x-workspace-slug']) as string | undefined;

    if (!orgSlug || !wsSlug) {
      return next(AppError.badRequest('Organization slug and workspace slug are required for context resolution'));
    }

    const org = await organizationRepository.findBySlug(orgSlug);
    if (!org || org.isArchived) {
      return next(AppError.notFound(`Organization '${orgSlug}' not found`));
    }

    const ws = await workspaceRepository.findByOrgAndSlug(org._id, wsSlug);
    if (!ws || ws.isArchived) {
      return next(AppError.notFound(`Workspace '${wsSlug}' not found`));
    }

    const membership = await membershipRepository.findByUserAndWorkspace(userId, ws._id);
    if (!membership) {
      return next(AppError.forbidden(`You are not a member of workspace '${wsSlug}'`));
    }

    req.organization = org;
    req.workspace = ws;
    req.membership = membership;
    return next();
  } catch (error) {
    return next(error as Error);
  }
};
