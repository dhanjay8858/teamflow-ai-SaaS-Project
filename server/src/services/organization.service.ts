import { Types } from 'mongoose';
import { organizationRepository, OrganizationRepository } from '../repositories/organization.repository.js';
import { workspaceRepository, WorkspaceRepository } from '../repositories/workspace.repository.js';
import { membershipRepository, MembershipRepository } from '../repositories/membership.repository.js';
import { IOrganizationDocument, MembershipRole, MembershipStatus, WorkspaceVisibility } from '../types/organization.types.js';
import { AppError } from '../utils/appError.js';
import { domainEventBus } from '../events/domainEventBus.js';
import { DomainEventType } from '../types/activity.types.js';

export class OrganizationService {
  constructor(
    private orgRepo: OrganizationRepository = organizationRepository,
    private wsRepo: WorkspaceRepository = workspaceRepository,
    private memberRepo: MembershipRepository = membershipRepository
  ) {}

  public async createOrganization(
    userId: string,
    payload: { name: string; slug: string; description?: string; logo?: string }
  ): Promise<{ organization: IOrganizationDocument; defaultWorkspaceId: string }> {
    const userObjectId = new Types.ObjectId(userId);

    const existingSlug = await this.orgRepo.findBySlug(payload.slug);
    if (existingSlug) {
      throw AppError.conflict('An organization with this slug already exists');
    }

    // 1. Create Organization
    const organization = await this.orgRepo.create({
      name: payload.name,
      slug: payload.slug.toLowerCase(),
      description: payload.description || '',
      logo: payload.logo || '',
      owner: userObjectId,
      membersCount: 1,
      workspaceCount: 1,
    });

    // 2. Auto-create default General workspace
    const defaultWorkspace = await this.wsRepo.create({
      organization: organization._id,
      name: 'General',
      slug: 'general',
      description: 'Default primary workspace',
      visibility: WorkspaceVisibility.INTERNAL,
      createdBy: userObjectId,
      isDefault: true,
    });

    // 3. Auto-create Owner membership
    await this.memberRepo.create({
      organization: organization._id,
      workspace: defaultWorkspace._id,
      user: userObjectId,
      role: MembershipRole.OWNER,
      status: MembershipStatus.ACTIVE,
    });

    // Publish Domain Event
    domainEventBus.publish(DomainEventType.ORGANIZATION_CREATED, {
      organizationId: organization._id.toString(),
      name: organization.name,
      ownerUserId: userId,
    });

    return {
      organization,
      defaultWorkspaceId: defaultWorkspace._id.toString(),
    };
  }

  public async getUserOrganizations(userId: string): Promise<IOrganizationDocument[]> {
    const memberships = await this.memberRepo.findUserWorkspaceMemberships(userId);
    const orgIds = Array.from(new Set(memberships.map((m) => m.organization._id.toString())));
    
    // Bulk fetch in single query
    return this.orgRepo.findByIds(orgIds);
  }

  public async getOrganizationById(id: string): Promise<IOrganizationDocument> {
    const org = await this.orgRepo.findById(id);
    if (!org || org.isArchived) {
      throw AppError.notFound('Organization not found');
    }
    return org;
  }

  public async updateOrganization(
    userId: string,
    orgId: string,
    updateData: { name?: string; description?: string; logo?: string }
  ): Promise<IOrganizationDocument> {
    const org = await this.getOrganizationById(orgId);
    if (org.owner.toString() !== userId) {
      throw AppError.forbidden('Only the organization owner can perform updates');
    }

    const updated = await this.orgRepo.update(orgId, updateData);
    if (!updated) throw AppError.internal('Failed to update organization');
    return updated;
  }

  public async archiveOrganization(userId: string, orgId: string): Promise<void> {
    const org = await this.getOrganizationById(orgId);
    if (org.owner.toString() !== userId) {
      throw AppError.forbidden('Only the organization owner can archive an organization');
    }

    await this.orgRepo.archive(orgId);
  }
}

export const organizationService = new OrganizationService();
