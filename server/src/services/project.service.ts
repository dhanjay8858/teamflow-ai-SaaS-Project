import { Types } from 'mongoose';
import { projectRepository, ProjectRepository } from '../repositories/project.repository.js';
import { projectMemberRepository, ProjectMemberRepository } from '../repositories/projectMember.repository.js';
import { workspaceRepository, WorkspaceRepository } from '../repositories/workspace.repository.js';
import { membershipRepository, MembershipRepository } from '../repositories/membership.repository.js';
import { IProjectDocument, ProjectStatus, ProjectVisibility, ProjectMemberRole } from '../types/project.types.js';
import { MembershipRole } from '../types/organization.types.js';
import { AppError } from '../utils/appError.js';
import { domainEventBus } from '../events/domainEventBus.js';
import { DomainEventType } from '../types/activity.types.js';
import { projectsCounter } from '../utils/metrics.js';
import { boardService } from './board.service.js';

export class ProjectService {
  constructor(
    private projectRepo: ProjectRepository = projectRepository,
    private projMemberRepo: ProjectMemberRepository = projectMemberRepository,
    private wsRepo: WorkspaceRepository = workspaceRepository,
    private wsMemberRepo: MembershipRepository = membershipRepository
  ) {}

  public async createProject(
    userId: string,
    payload: {
      workspaceId: string;
      name: string;
      slug: string;
      description?: string;
      icon?: string;
      color?: string;
      visibility?: ProjectVisibility;
      startDate?: string;
      targetDate?: string;
    }
  ): Promise<IProjectDocument> {
    const ws = await this.wsRepo.findById(payload.workspaceId);
    if (!ws || ws.isArchived) {
      throw AppError.notFound('Workspace not found');
    }

    // Permission check: Workspace OWNER or ADMIN required to create projects
    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(userId, ws._id.toString());
    if (
      !wsMembership ||
      (wsMembership.role !== MembershipRole.OWNER && wsMembership.role !== MembershipRole.ADMIN)
    ) {
      throw AppError.forbidden('Only workspace Owners and Admins can create projects');
    }

    const existingSlug = await this.projectRepo.findByWsAndSlug(ws._id, payload.slug);
    if (existingSlug) {
      throw AppError.conflict('A project with this slug already exists in this workspace');
    }

    const userObjectId = new Types.ObjectId(userId);

    const project = await this.projectRepo.create({
      workspace: ws._id,
      name: payload.name,
      slug: payload.slug.toLowerCase(),
      description: payload.description || '',
      icon: payload.icon || 'folder',
      color: payload.color || '#6366f1',
      status: ProjectStatus.ACTIVE,
      visibility: payload.visibility || ProjectVisibility.WORKSPACE,
      createdBy: userObjectId,
      startDate: payload.startDate ? new Date(payload.startDate) : null,
      targetDate: payload.targetDate ? new Date(payload.targetDate) : null,
    });

    // Auto-create OWNER membership in ProjectMember
    await this.projMemberRepo.create({
      project: project._id,
      user: userObjectId,
      role: ProjectMemberRole.OWNER,
      joinedAt: new Date(),
    });

    // Auto-create default "Backlog" board
    await boardService.ensureDefaultBoard(project._id.toString(), userId);

    // Publish Domain Event
    projectsCounter.inc();

    domainEventBus.publish(DomainEventType.PROJECT_CREATED, {
      projectId: project._id.toString(),
      workspaceId: ws._id.toString(),
      organizationId: ws.organization.toString(),
      name: project.name,
      createdByUserId: userId,
    });

    return project;
  }

  public async getWorkspaceProjects(userId: string, workspaceId: string, includeArchived = false): Promise<IProjectDocument[]> {
    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(userId, workspaceId);
    if (!wsMembership) {
      throw AppError.forbidden('You are not a member of this workspace');
    }

    return this.projectRepo.findWorkspaceProjects(workspaceId, includeArchived);
  }

  public async getProjectById(userId: string, projectId: string): Promise<IProjectDocument> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');

    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(userId, project.workspace._id.toString());
    if (!wsMembership) throw AppError.forbidden('Access denied');

    return project;
  }

  public async updateProject(
    userId: string,
    projectId: string,
    updateData: {
      name?: string;
      description?: string;
      icon?: string;
      color?: string;
      status?: ProjectStatus;
      visibility?: ProjectVisibility;
      startDate?: string;
      targetDate?: string;
    }
  ): Promise<IProjectDocument> {
    const project = await this.getProjectById(userId, projectId);

    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(userId, project.workspace._id.toString());
    const projMember = await this.projMemberRepo.findByProjectAndUser(projectId, userId);

    const isWsAdmin = wsMembership?.role === MembershipRole.OWNER || wsMembership?.role === MembershipRole.ADMIN;
    const isProjAdmin = projMember?.role === ProjectMemberRole.OWNER || projMember?.role === ProjectMemberRole.MANAGER;

    if (!isWsAdmin && !isProjAdmin) {
      throw AppError.forbidden('Only project managers and workspace admins can update project settings');
    }

    const updated = await this.projectRepo.update(projectId, {
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.icon && { icon: updateData.icon }),
      ...(updateData.color && { color: updateData.color }),
      ...(updateData.status && { status: updateData.status }),
      ...(updateData.visibility && { visibility: updateData.visibility }),
      ...(updateData.startDate !== undefined && { startDate: updateData.startDate ? new Date(updateData.startDate) : null }),
      ...(updateData.targetDate !== undefined && { targetDate: updateData.targetDate ? new Date(updateData.targetDate) : null }),
    });

    if (!updated) throw AppError.internal('Failed to update project');

    domainEventBus.publish(DomainEventType.PROJECT_UPDATED, {
      projectId,
      workspaceId: project.workspace._id.toString(),
      updatedByUserId: userId,
    });

    return updated;
  }

  public async archiveProject(userId: string, projectId: string): Promise<void> {
    const project = await this.getProjectById(userId, projectId);

    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(userId, project.workspace._id.toString());
    const projMember = await this.projMemberRepo.findByProjectAndUser(projectId, userId);

    const isWsAdmin = wsMembership?.role === MembershipRole.OWNER || wsMembership?.role === MembershipRole.ADMIN;
    const isProjOwner = projMember?.role === ProjectMemberRole.OWNER;

    if (!isWsAdmin && !isProjOwner) {
      throw AppError.forbidden('Only workspace admins and project owners can archive a project');
    }

    await this.projectRepo.archive(projectId);

    domainEventBus.publish(DomainEventType.PROJECT_ARCHIVED, {
      projectId,
      workspaceId: project.workspace._id.toString(),
      archivedByUserId: userId,
    });
  }
}

export const projectService = new ProjectService();
