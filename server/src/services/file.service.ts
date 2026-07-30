import { Types } from 'mongoose';
import { fileRepository, FileRepository } from '../repositories/file.repository.js';
import { membershipRepository, MembershipRepository } from '../repositories/membership.repository.js';
import { taskRepository, TaskRepository } from '../repositories/task.repository.js';
import { projectRepository, ProjectRepository } from '../repositories/project.repository.js';
import { IFileDocument } from '../models/file.model.js';
import {
  validateMimeType,
  validateFileSize,
  getFileExtension,
  uploadToCloudinary,
  deleteFromCloudinary,
} from './cloudinary.service.js';
import { AppError } from '../utils/appError.js';
import { domainEventBus } from '../events/domainEventBus.js';
import { DomainEventType } from '../types/activity.types.js';
import { uploadsCounter } from '../utils/metrics.js';

export interface UploadFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  workspaceId: string;
  projectId?: string;
  taskId?: string;
  uploadedBy: string;
}

export class FileService {
  constructor(
    private fileRepo: FileRepository = fileRepository,
    private wsMemberRepo: MembershipRepository = membershipRepository,
    private taskRepo: TaskRepository = taskRepository,
    private projectRepo: ProjectRepository = projectRepository
  ) {}

  /** Determine Cloudinary folder based on context */
  private getFolderPath(workspaceId: string, projectId?: string, taskId?: string): string {
    if (taskId) return `workspace/${workspaceId}/project/${projectId || 'general'}/task/${taskId}`;
    if (projectId) return `workspace/${workspaceId}/project/${projectId}`;
    return `workspace/${workspaceId}`;
  }

  /** Verify requesting user is a member of the workspace */
  private async verifyWorkspaceMembership(userId: string, workspaceId: string): Promise<void> {
    const membership = await this.wsMemberRepo.findByUserAndWorkspace(userId, workspaceId);
    if (!membership) throw AppError.forbidden('You are not a member of this workspace');
  }

  public async uploadFile(userId: string, input: UploadFileInput): Promise<IFileDocument> {
    // 1. Validate membership
    await this.verifyWorkspaceMembership(userId, input.workspaceId);

    // 2. Validate MIME type & size
    validateMimeType(input.mimeType);
    validateFileSize(input.size);

    // 3. If taskId provided — verify task belongs to workspace
    if (input.taskId) {
      const task = await this.taskRepo.findById(input.taskId);
      if (!task) throw AppError.notFound('Task not found');
      if (task.workspace.toString() !== input.workspaceId) {
        throw AppError.forbidden('Task does not belong to this workspace');
      }
    }

    // 4. If projectId provided — verify project belongs to workspace
    if (input.projectId) {
      const project = await this.projectRepo.findById(input.projectId);
      if (!project) throw AppError.notFound('Project not found');
      const wsId = project.workspace._id ? project.workspace._id.toString() : project.workspace.toString();
      if (wsId !== input.workspaceId) {
        throw AppError.forbidden('Project does not belong to this workspace');
      }
    }

    // 5. Upload to Cloudinary
    const folder = this.getFolderPath(input.workspaceId, input.projectId, input.taskId);
    const uploadResult = await uploadToCloudinary(
      input.buffer,
      input.mimeType,
      folder,
      input.originalName
    );

    const extension = getFileExtension(input.originalName);

    // 6. Persist metadata only in MongoDB
    const file = await this.fileRepo.create({
      workspace: new Types.ObjectId(input.workspaceId),
      project: input.projectId ? new Types.ObjectId(input.projectId) : null,
      task: input.taskId ? new Types.ObjectId(input.taskId) : null,
      uploadedBy: new Types.ObjectId(input.uploadedBy),
      originalName: input.originalName,
      displayName: input.originalName,
      mimeType: input.mimeType,
      extension,
      size: input.size,
      cloudinaryPublicId: uploadResult.publicId,
      url: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      width: uploadResult.width,
      height: uploadResult.height,
      duration: uploadResult.duration,
    });

    uploadsCounter.inc();

    domainEventBus.publish(DomainEventType.FILE_UPLOADED, {
      fileId: file._id.toString(),
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      taskId: input.taskId,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      uploadedByUserId: userId,
    });

    return file;
  }

  public async getFile(userId: string, fileId: string): Promise<IFileDocument> {
    const file = await this.fileRepo.findById(fileId);
    if (!file) throw AppError.notFound('File not found');

    await this.verifyWorkspaceMembership(userId, file.workspace.toString());
    return file;
  }

  public async getTaskFiles(userId: string, taskId: string): Promise<IFileDocument[]> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    await this.verifyWorkspaceMembership(userId, task.workspace.toString());
    return this.fileRepo.findByTaskId(taskId);
  }

  public async getProjectFiles(userId: string, projectId: string): Promise<IFileDocument[]> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');

    const wsId = project.workspace._id ? project.workspace._id.toString() : project.workspace.toString();
    await this.verifyWorkspaceMembership(userId, wsId);
    return this.fileRepo.findByProjectId(projectId);
  }

  public async getWorkspaceFiles(userId: string, workspaceId: string): Promise<IFileDocument[]> {
    await this.verifyWorkspaceMembership(userId, workspaceId);
    return this.fileRepo.findByWorkspaceId(workspaceId);
  }

  public async renameFile(userId: string, fileId: string, displayName: string): Promise<IFileDocument> {
    const file = await this.fileRepo.findById(fileId);
    if (!file) throw AppError.notFound('File not found');

    await this.verifyWorkspaceMembership(userId, file.workspace.toString());

    const updated = await this.fileRepo.update(fileId, { displayName: displayName.trim() });
    if (!updated) throw AppError.internal('Failed to rename file');

    domainEventBus.publish(DomainEventType.FILE_RENAMED, {
      fileId,
      workspaceId: file.workspace.toString(),
      newDisplayName: displayName,
      renamedByUserId: userId,
    });

    return updated;
  }

  public async deleteFile(userId: string, fileId: string): Promise<void> {
    const file = await this.fileRepo.findById(fileId);
    if (!file) throw AppError.notFound('File not found');

    await this.verifyWorkspaceMembership(userId, file.workspace.toString());

    // Ownership check — only uploader can delete
    if (file.uploadedBy._id.toString() !== userId) {
      throw AppError.forbidden('Only the uploader can delete this file');
    }

    // Soft delete in MongoDB
    await this.fileRepo.softDelete(fileId);

    // Hard delete from Cloudinary
    await deleteFromCloudinary(file.cloudinaryPublicId, file.mimeType);

    domainEventBus.publish(DomainEventType.FILE_DELETED, {
      fileId,
      workspaceId: file.workspace.toString(),
      deletedByUserId: userId,
    });
  }

  public async restoreFile(userId: string, fileId: string): Promise<IFileDocument> {
    const file = await this.fileRepo.findDeletedById(fileId);
    if (!file) throw AppError.notFound('File not found');
    if (!file.isDeleted) throw AppError.badRequest('File is not deleted');

    await this.verifyWorkspaceMembership(userId, file.workspace.toString());

    const restored = await this.fileRepo.restore(fileId);
    if (!restored) throw AppError.internal('Failed to restore file');

    domainEventBus.publish(DomainEventType.FILE_RESTORED, {
      fileId,
      workspaceId: file.workspace.toString(),
      restoredByUserId: userId,
    });

    return restored;
  }
}

export const fileService = new FileService();
