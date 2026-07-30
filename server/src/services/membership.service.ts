import { Types } from 'mongoose';
import { membershipRepository, MembershipRepository } from '../repositories/membership.repository.js';
import { workspaceRepository, WorkspaceRepository } from '../repositories/workspace.repository.js';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { IMembershipDocument, MembershipRole, MembershipStatus } from '../types/organization.types.js';
import { AppError } from '../utils/appError.js';
import { domainEventBus } from '../events/domainEventBus.js';
import { DomainEventType } from '../types/activity.types.js';

export class MembershipService {
  constructor(
    private memberRepo: MembershipRepository = membershipRepository,
    private wsRepo: WorkspaceRepository = workspaceRepository,
    private userRepo: UserRepository = userRepository
  ) {}

  public async getWorkspaceMembers(workspaceId: string): Promise<IMembershipDocument[]> {
    return this.memberRepo.findWorkspaceMembers(workspaceId);
  }

  public async getUserMemberships(userId: string): Promise<IMembershipDocument[]> {
    return this.memberRepo.findUserWorkspaceMemberships(userId);
  }

  public async addMember(
    workspaceId: string,
    targetUserId: string,
    role: MembershipRole = MembershipRole.MEMBER
  ): Promise<IMembershipDocument> {
    const ws = await this.wsRepo.findById(workspaceId);
    if (!ws || ws.isArchived) {
      throw AppError.notFound('Workspace not found');
    }

    const user = await this.userRepo.findById(targetUserId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const existing = await this.memberRepo.findByUserAndWorkspace(targetUserId, workspaceId);
    if (existing) {
      throw AppError.conflict('User is already an active member of this workspace');
    }

    const membership = await this.memberRepo.create({
      organization: ws.organization,
      workspace: ws._id,
      user: user._id,
      role,
      status: MembershipStatus.ACTIVE,
      joinedAt: new Date(),
    });

    // Publish Domain Event
    domainEventBus.publish(DomainEventType.MEMBERSHIP_ADDED, {
      membershipId: membership._id.toString(),
      workspaceId,
      organizationId: ws.organization.toString(),
      userId: targetUserId,
      role,
    });

    return membership;
  }

  public async updateRole(
    requestingUserId: string,
    membershipId: string,
    newRole: MembershipRole
  ): Promise<IMembershipDocument> {
    const targetMembership = await this.memberRepo.findById(membershipId);
    if (!targetMembership) {
      throw AppError.notFound('Membership record not found');
    }

    // Verify requester has OWNER or ADMIN role in the target workspace
    const requesterMembership = await this.memberRepo.findByUserAndWorkspace(
      requestingUserId,
      targetMembership.workspace._id.toString()
    );

    if (
      !requesterMembership ||
      (requesterMembership.role !== MembershipRole.OWNER && requesterMembership.role !== MembershipRole.ADMIN)
    ) {
      throw AppError.forbidden('Only workspace Owners and Admins can modify member roles');
    }

    const updated = await this.memberRepo.updateRole(membershipId, newRole);
    if (!updated) {
      throw AppError.notFound('Membership record not found');
    }

    // Publish Domain Event
    domainEventBus.publish(DomainEventType.ROLE_CHANGED, {
      membershipId,
      workspaceId: targetMembership.workspace._id.toString(),
      organizationId: targetMembership.organization._id.toString(),
      requestingUserId,
      targetUserId: targetMembership.user._id.toString(),
      newRole,
    });

    return updated;
  }

  public async removeMember(requestingUserId: string, membershipId: string): Promise<void> {
    const targetMembership = await this.memberRepo.findById(membershipId);
    if (!targetMembership) {
      throw AppError.notFound('Membership record not found');
    }

    const requesterMembership = await this.memberRepo.findByUserAndWorkspace(
      requestingUserId,
      targetMembership.workspace._id.toString()
    );

    const isSelf = targetMembership.user._id.toString() === requestingUserId;

    if (
      !isSelf &&
      (!requesterMembership ||
        (requesterMembership.role !== MembershipRole.OWNER && requesterMembership.role !== MembershipRole.ADMIN))
    ) {
      throw AppError.forbidden('Only workspace Owners and Admins can remove members from a workspace');
    }

    // Prevent removing sole OWNER
    if (targetMembership.role === MembershipRole.OWNER) {
      const workspaceMembers = await this.memberRepo.findWorkspaceMembers(targetMembership.workspace._id.toString());
      const ownerCount = workspaceMembers.filter((m) => m.role === MembershipRole.OWNER).length;
      if (ownerCount <= 1) {
        throw AppError.badRequest('Cannot remove the primary workspace owner. Transfer ownership first.');
      }
    }

    const updated = await this.memberRepo.removeMember(membershipId);
    if (!updated) {
      throw AppError.notFound('Membership record not found');
    }

    // Publish Domain Event
    domainEventBus.publish(DomainEventType.MEMBERSHIP_REMOVED, {
      membershipId,
      workspaceId: targetMembership.workspace._id.toString(),
      organizationId: targetMembership.organization._id.toString(),
      requestingUserId,
      targetUserId: targetMembership.user._id.toString(),
    });
  }
}

export const membershipService = new MembershipService();
