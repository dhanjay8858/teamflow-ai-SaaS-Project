import { Types } from 'mongoose';
import { workspaceContextRepository, WorkspaceContextRepository } from '../repositories/context.repository.js';
import { organizationRepository, OrganizationRepository } from '../repositories/organization.repository.js';
import { workspaceRepository, WorkspaceRepository } from '../repositories/workspace.repository.js';
import { membershipRepository, MembershipRepository } from '../repositories/membership.repository.js';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { IOrganizationDocument, IWorkspaceDocument, IMembershipDocument } from '../types/organization.types.js';
import { AppError } from '../utils/appError.js';

export interface WorkspaceContextData {
  organization: IOrganizationDocument;
  workspace: IWorkspaceDocument;
  membership: IMembershipDocument;
}

export class WorkspaceContextService {
  constructor(
    private contextRepo: WorkspaceContextRepository = workspaceContextRepository,
    private orgRepo: OrganizationRepository = organizationRepository,
    private wsRepo: WorkspaceRepository = workspaceRepository,
    private memberRepo: MembershipRepository = membershipRepository,
    private userRepo: UserRepository = userRepository
  ) {}

  public async getCurrentContext(userId: string): Promise<WorkspaceContextData> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    let targetOrg: IOrganizationDocument | null = null;
    let targetWs: IWorkspaceDocument | null = null;
    let targetMembership: IMembershipDocument | null = null;

    // 1. Try restoring from last saved user preferences
    if (user.lastOrganization && user.lastWorkspace) {
      targetOrg = await this.orgRepo.findById(user.lastOrganization);
      if (targetOrg && !targetOrg.isArchived) {
        targetWs = await this.wsRepo.findById(user.lastWorkspace);
        if (targetWs && !targetWs.isArchived && targetWs.organization.toString() === targetOrg._id.toString()) {
          targetMembership = await this.memberRepo.findByUserAndWorkspace(userId, targetWs._id.toString());
        }
      }
    }

    // 2. Fallback to first available active organization & default workspace if preferences missing/invalid
    if (!targetOrg || !targetWs || !targetMembership) {
      const userMemberships = await this.memberRepo.findUserWorkspaceMemberships(userId);
      if (userMemberships.length === 0) {
        throw AppError.notFound('User does not belong to any active workspaces. Please create or join an organization.');
      }

      targetMembership = userMemberships[0];
      targetWs = await this.wsRepo.findById(targetMembership.workspace._id.toString());
      if (!targetWs || targetWs.isArchived) throw AppError.notFound('Default workspace not found');

      targetOrg = await this.orgRepo.findById(targetWs.organization.toString());
      if (!targetOrg || targetOrg.isArchived) throw AppError.notFound('Organization not found');

      // Update user preferences to fallback context
      await this.contextRepo.updateUserLastContext(userId, targetOrg._id, targetWs._id);
    }

    return {
      organization: targetOrg,
      workspace: targetWs,
      membership: targetMembership,
    };
  }

  public async switchWorkspaceContext(
    userId: string,
    payload: { organizationSlug: string; workspaceSlug: string }
  ): Promise<WorkspaceContextData> {
    const org = await this.orgRepo.findBySlug(payload.organizationSlug);
    if (!org || org.isArchived) {
      throw AppError.notFound(`Organization with slug '${payload.organizationSlug}' not found`);
    }

    const ws = await this.wsRepo.findByOrgAndSlug(org._id, payload.workspaceSlug);
    if (!ws || ws.isArchived) {
      throw AppError.notFound(`Workspace with slug '${payload.workspaceSlug}' not found in organization '${org.name}'`);
    }

    const membership = await this.memberRepo.findByUserAndWorkspace(userId, ws._id);
    if (!membership) {
      throw AppError.forbidden(`You do not have active membership in workspace '${ws.name}'`);
    }

    // Persist new active context preferences to User model in database
    await this.contextRepo.updateUserLastContext(userId, org._id, ws._id);

    return {
      organization: org,
      workspace: ws,
      membership,
    };
  }
}

export const workspaceContextService = new WorkspaceContextService();
