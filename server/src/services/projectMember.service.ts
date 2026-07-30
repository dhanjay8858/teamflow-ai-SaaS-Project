import { Types } from 'mongoose';
import { projectMemberRepository, ProjectMemberRepository } from '../repositories/projectMember.repository.js';
import { projectRepository, ProjectRepository } from '../repositories/project.repository.js';
import { membershipRepository, MembershipRepository } from '../repositories/membership.repository.js';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { IProjectMemberDocument, ProjectMemberRole } from '../types/project.types.js';
import { MembershipRole } from '../types/organization.types.js';
import { AppError } from '../utils/appError.js';
import { domainEventBus } from '../events/domainEventBus.js';
import { DomainEventType } from '../types/activity.types.js';

export class ProjectMemberService {
  constructor(
    private memberRepo: ProjectMemberRepository = projectMemberRepository,
    private projectRepo: ProjectRepository = projectRepository,
    private wsMemberRepo: MembershipRepository = membershipRepository,
    private userRepo: UserRepository = userRepository
  ) {}

  public async getProjectMembers(projectId: string): Promise<IProjectMemberDocument[]> {
    return this.memberRepo.findProjectMembers(projectId);
  }

  public async addMember(
    requestingUserId: string,
    projectId: string,
    targetUserId: string,
    role: ProjectMemberRole = ProjectMemberRole.CONTRIBUTOR
  ): Promise<IProjectMemberDocument> {
    const project = await this.projectRepo.findById(projectId);
    if (!project || project.isArchived) {
      throw AppError.notFound('Project not found');
    }

    // 1. Verify target user exists
    const targetUser = await this.userRepo.findById(targetUserId);
    if (!targetUser) {
      throw AppError.notFound('User not found');
    }

    // 2. CRITICAL RULE: Verify target user is an active member of the workspace
    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(
      targetUserId,
      project.workspace._id.toString()
    );
    if (!wsMembership) {
      throw AppError.forbidden('User must be a member of the workspace before being added to a project');
    }

    // 3. Verify requester has permission (Workspace OWNER/ADMIN or Project OWNER/MANAGER)
    const requesterWsMembership = await this.wsMemberRepo.findByUserAndWorkspace(
      requestingUserId,
      project.workspace._id.toString()
    );
    const requesterProjMember = await this.memberRepo.findByProjectAndUser(projectId, requestingUserId);

    const isWsAdmin = requesterWsMembership?.role === MembershipRole.OWNER || requesterWsMembership?.role === MembershipRole.ADMIN;
    const isProjAdmin = requesterProjMember?.role === ProjectMemberRole.OWNER || requesterProjMember?.role === ProjectMemberRole.MANAGER;

    if (!isWsAdmin && !isProjAdmin) {
      throw AppError.forbidden('Only workspace admins and project managers can add project members');
    }

    // 4. Verify user is not already in project
    const existing = await this.memberRepo.findByProjectAndUser(projectId, targetUserId);
    if (existing) {
      throw AppError.conflict('User is already a member of this project');
    }

    const member = await this.memberRepo.create({
      project: project._id,
      user: targetUser._id,
      role,
      joinedAt: new Date(),
    });

    // Publish Domain Event
    domainEventBus.publish(DomainEventType.PROJECT_MEMBER_ADDED, {
      projectId: project._id.toString(),
      workspaceId: project.workspace._id.toString(),
      organizationId: (project.workspace as any).organization ? (project.workspace as any).organization.toString() : '',
      userId: targetUserId,
      role,
      addedByUserId: requestingUserId,
    });

    return member;
  }

  public async updateRole(
    requestingUserId: string,
    projectId: string,
    memberId: string,
    newRole: ProjectMemberRole
  ): Promise<IProjectMemberDocument> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');

    const targetMember = await this.memberRepo.findById(memberId);
    if (!targetMember) throw AppError.notFound('Project member record not found');

    // Verify permission
    const requesterWsMembership = await this.wsMemberRepo.findByUserAndWorkspace(
      requestingUserId,
      project.workspace._id.toString()
    );
    const requesterProjMember = await this.memberRepo.findByProjectAndUser(projectId, requestingUserId);

    const isWsAdmin = requesterWsMembership?.role === MembershipRole.OWNER || requesterWsMembership?.role === MembershipRole.ADMIN;
    const isProjAdmin = requesterProjMember?.role === ProjectMemberRole.OWNER || requesterProjMember?.role === ProjectMemberRole.MANAGER;

    if (!isWsAdmin && !isProjAdmin) {
      throw AppError.forbidden('Only workspace admins and project managers can update project member roles');
    }

    const updated = await this.memberRepo.updateRole(memberId, newRole);
    if (!updated) throw AppError.internal('Failed to update project member role');

    domainEventBus.publish(DomainEventType.PROJECT_ROLE_CHANGED, {
      projectId: project._id.toString(),
      workspaceId: project.workspace._id.toString(),
      memberId,
      targetUserId: targetMember.user._id.toString(),
      newRole,
      requestingUserId,
    });

    return updated;
  }

  public async removeMember(requestingUserId: string, projectId: string, memberId: string): Promise<void> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');

    const targetMember = await this.memberRepo.findById(memberId);
    if (!targetMember) throw AppError.notFound('Project member record not found');

    const isSelf = targetMember.user._id.toString() === requestingUserId;

    const requesterWsMembership = await this.wsMemberRepo.findByUserAndWorkspace(
      requestingUserId,
      project.workspace._id.toString()
    );
    const requesterProjMember = await this.memberRepo.findByProjectAndUser(projectId, requestingUserId);

    const isWsAdmin = requesterWsMembership?.role === MembershipRole.OWNER || requesterWsMembership?.role === MembershipRole.ADMIN;
    const isProjAdmin = requesterProjMember?.role === ProjectMemberRole.OWNER || requesterProjMember?.role === ProjectMemberRole.MANAGER;

    if (!isSelf && !isWsAdmin && !isProjAdmin) {
      throw AppError.forbidden('Only workspace admins and project managers can remove project members');
    }

    // Prevent removing sole OWNER of project
    if (targetMember.role === ProjectMemberRole.OWNER) {
      const allMembers = await this.memberRepo.findProjectMembers(projectId);
      const ownerCount = allMembers.filter((m) => m.role === ProjectMemberRole.OWNER).length;
      if (ownerCount <= 1) {
        throw AppError.badRequest('Cannot remove the primary project owner. Transfer ownership first.');
      }
    }

    await this.memberRepo.removeMember(memberId);

    domainEventBus.publish(DomainEventType.PROJECT_MEMBER_REMOVED, {
      projectId: project._id.toString(),
      workspaceId: project.workspace._id.toString(),
      memberId,
      targetUserId: targetMember.user._id.toString(),
      requestingUserId,
    });
  }
}

export const projectMemberService = new ProjectMemberService();
