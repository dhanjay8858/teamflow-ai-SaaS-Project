import { Types } from 'mongoose';
import { workspaceRepository, WorkspaceRepository } from '../repositories/workspace.repository.js';
import { organizationRepository, OrganizationRepository } from '../repositories/organization.repository.js';
import { membershipRepository, MembershipRepository } from '../repositories/membership.repository.js';
import { IWorkspaceDocument, MembershipRole, MembershipStatus, WorkspaceVisibility } from '../types/organization.types.js';
import { AppError } from '../utils/appError.js';
import { domainEventBus } from '../events/domainEventBus.js';
import { DomainEventType } from '../types/activity.types.js';

export class WorkspaceService {
  constructor(
    private wsRepo: WorkspaceRepository = workspaceRepository,
    private orgRepo: OrganizationRepository = organizationRepository,
    private memberRepo: MembershipRepository = membershipRepository
  ) {}

  public async createWorkspace(
    userId: string,
    payload: {
      organizationId: string;
      name: string;
      slug: string;
      description?: string;
      icon?: string;
      visibility?: WorkspaceVisibility;
    }
  ): Promise<IWorkspaceDocument> {
    const userObjectId = new Types.ObjectId(userId);

    const org = await this.orgRepo.findById(payload.organizationId);
    if (!org || org.isArchived) {
      throw AppError.notFound('Organization not found');
    }

    const existingSlug = await this.wsRepo.findByOrgAndSlug(payload.organizationId, payload.slug);
    if (existingSlug) {
      throw AppError.conflict('A workspace with this slug already exists in this organization');
    }

    const workspace = await this.wsRepo.create({
      organization: org._id,
      name: payload.name,
      slug: payload.slug.toLowerCase(),
      description: payload.description || '',
      icon: payload.icon || '',
      visibility: payload.visibility || WorkspaceVisibility.INTERNAL,
      createdBy: userObjectId,
      isDefault: false,
    });

    // Auto-create Owner membership for creator in this new workspace
    await this.memberRepo.create({
      organization: org._id,
      workspace: workspace._id,
      user: userObjectId,
      role: MembershipRole.OWNER,
      status: MembershipStatus.ACTIVE,
    });

    await this.orgRepo.incrementWorkspaceCount(org._id, 1);

    // Publish Domain Event
    domainEventBus.publish(DomainEventType.WORKSPACE_CREATED, {
      workspaceId: workspace._id.toString(),
      organizationId: org._id.toString(),
      name: workspace.name,
      createdByUserId: userId,
    });

    return workspace;
  }

  public async getOrgWorkspaces(userId: string, organizationId: string): Promise<IWorkspaceDocument[]> {
    const org = await this.orgRepo.findById(organizationId);
    if (!org || org.isArchived) {
      throw AppError.notFound('Organization not found');
    }

    return this.wsRepo.findOrgWorkspaces(organizationId);
  }

  public async getWorkspaceById(workspaceId: string): Promise<IWorkspaceDocument> {
    const ws = await this.wsRepo.findById(workspaceId);
    if (!ws || ws.isArchived) {
      throw AppError.notFound('Workspace not found');
    }
    return ws;
  }

  public async updateWorkspace(
    workspaceId: string,
    updateData: { name?: string; description?: string; icon?: string; visibility?: WorkspaceVisibility }
  ): Promise<IWorkspaceDocument> {
    const updated = await this.wsRepo.update(workspaceId, updateData);
    if (!updated) throw AppError.internal('Failed to update workspace');
    return updated;
  }

  public async archiveWorkspace(workspaceId: string): Promise<void> {
    const ws = await this.getWorkspaceById(workspaceId);
    if (ws.isDefault) {
      throw AppError.badRequest('Cannot archive the default workspace');
    }
    await this.wsRepo.archive(workspaceId);
  }
}

export const workspaceService = new WorkspaceService();
