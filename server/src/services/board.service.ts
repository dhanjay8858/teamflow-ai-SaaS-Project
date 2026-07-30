import { Types } from 'mongoose';
import { boardRepository, BoardRepository } from '../repositories/board.repository.js';
import { projectRepository, ProjectRepository } from '../repositories/project.repository.js';
import { projectMemberRepository, ProjectMemberRepository } from '../repositories/projectMember.repository.js';
import { membershipRepository, MembershipRepository } from '../repositories/membership.repository.js';
import { IBoardDocument, ReorderBoardItem } from '../types/board.types.js';
import { ProjectMemberRole } from '../types/project.types.js';
import { MembershipRole } from '../types/organization.types.js';
import { AppError } from '../utils/appError.js';
import { domainEventBus } from '../events/domainEventBus.js';
import { DomainEventType } from '../types/activity.types.js';

export class BoardService {
  constructor(
    private boardRepo: BoardRepository = boardRepository,
    private projectRepo: ProjectRepository = projectRepository,
    private projMemberRepo: ProjectMemberRepository = projectMemberRepository,
    private wsMemberRepo: MembershipRepository = membershipRepository
  ) {}

  private async checkBoardAdminPermission(userId: string, workspaceId: string, projectId: string): Promise<void> {
    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(userId, workspaceId);
    const projMember = await this.projMemberRepo.findByProjectAndUser(projectId, userId);

    const isWsAdmin = wsMembership?.role === MembershipRole.OWNER || wsMembership?.role === MembershipRole.ADMIN;
    const isProjAdmin = projMember?.role === ProjectMemberRole.OWNER || projMember?.role === ProjectMemberRole.MANAGER;

    if (!isWsAdmin && !isProjAdmin) {
      throw AppError.forbidden('Only project managers and workspace admins can manage boards');
    }
  }

  public async ensureDefaultBoard(projectId: string, createdByUserId: string): Promise<IBoardDocument> {
    const existing = await this.boardRepo.findProjectBoards(projectId, true);
    if (existing.length > 0) {
      return existing[0];
    }

    const userObjectId = new Types.ObjectId(createdByUserId);

    return this.boardRepo.create({
      project: new Types.ObjectId(projectId),
      name: 'Backlog',
      slug: 'backlog',
      description: 'Default primary project backlog board',
      color: '#6366f1',
      position: 1,
      isDefault: true,
      createdBy: userObjectId,
    });
  }

  public async createBoard(
    userId: string,
    payload: {
      projectId: string;
      name: string;
      slug: string;
      description?: string;
      color?: string;
    }
  ): Promise<IBoardDocument> {
    const project = await this.projectRepo.findById(payload.projectId);
    if (!project || project.isArchived) {
      throw AppError.notFound('Project not found');
    }

    await this.checkBoardAdminPermission(userId, project.workspace._id.toString(), project._id.toString());

    const existingSlug = await this.boardRepo.findByProjectAndSlug(project._id, payload.slug);
    if (existingSlug) {
      throw AppError.conflict('A board with this slug already exists in this project');
    }

    const maxPosition = await this.boardRepo.getMaxPosition(project._id);
    const userObjectId = new Types.ObjectId(userId);

    const board = await this.boardRepo.create({
      project: project._id,
      name: payload.name,
      slug: payload.slug.toLowerCase(),
      description: payload.description || '',
      color: payload.color || '#6366f1',
      position: maxPosition + 1,
      isDefault: false,
      createdBy: userObjectId,
    });

    domainEventBus.publish(DomainEventType.BOARD_CREATED, {
      boardId: board._id.toString(),
      projectId: project._id.toString(),
      workspaceId: project.workspace._id.toString(),
      name: board.name,
      createdByUserId: userId,
    });

    return board;
  }

  public async getProjectBoards(userId: string, projectId: string, includeArchived = false): Promise<IBoardDocument[]> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');

    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(userId, project.workspace._id.toString());
    if (!wsMembership) throw AppError.forbidden('Access denied');

    return this.boardRepo.findProjectBoards(projectId, includeArchived);
  }

  public async getBoardById(userId: string, boardId: string): Promise<IBoardDocument> {
    const board = await this.boardRepo.findById(boardId);
    if (!board) throw AppError.notFound('Board not found');

    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(userId, (board.project as any).workspace.toString());
    if (!wsMembership) throw AppError.forbidden('Access denied');

    return board;
  }

  public async updateBoard(
    userId: string,
    boardId: string,
    updateData: { name?: string; description?: string; color?: string }
  ): Promise<IBoardDocument> {
    const board = await this.boardRepo.findById(boardId);
    if (!board) throw AppError.notFound('Board not found');

    await this.checkBoardAdminPermission(
      userId,
      (board.project as any).workspace.toString(),
      board.project._id.toString()
    );

    const updated = await this.boardRepo.update(boardId, updateData);
    if (!updated) throw AppError.internal('Failed to update board');

    domainEventBus.publish(DomainEventType.BOARD_UPDATED, {
      boardId,
      projectId: board.project._id.toString(),
      updatedByUserId: userId,
    });

    return updated;
  }

  public async archiveBoard(userId: string, boardId: string): Promise<void> {
    const board = await this.boardRepo.findById(boardId);
    if (!board) throw AppError.notFound('Board not found');

    if (board.isDefault) {
      throw AppError.badRequest('Cannot archive the default project board');
    }

    await this.checkBoardAdminPermission(
      userId,
      (board.project as any).workspace.toString(),
      board.project._id.toString()
    );

    await this.boardRepo.archive(boardId);

    domainEventBus.publish(DomainEventType.BOARD_ARCHIVED, {
      boardId,
      projectId: board.project._id.toString(),
      archivedByUserId: userId,
    });
  }

  public async reorderBoards(userId: string, projectId: string, boards: ReorderBoardItem[]): Promise<void> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');

    await this.checkBoardAdminPermission(userId, project.workspace._id.toString(), projectId);

    await Promise.all(boards.map((b) => this.boardRepo.updatePosition(b.boardId, b.position)));

    domainEventBus.publish(DomainEventType.BOARD_REORDERED, {
      projectId,
      workspaceId: project.workspace._id.toString(),
      reorderedByUserId: userId,
    });
  }
}

export const boardService = new BoardService();
