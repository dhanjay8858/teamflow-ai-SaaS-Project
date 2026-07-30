import { ProjectModel } from '../models/project.model.js';
import { IProjectDocument, ProjectStatus } from '../types/project.types.js';
import { Types } from 'mongoose';

export class ProjectRepository {
  public async create(data: Partial<IProjectDocument>): Promise<IProjectDocument> {
    return ProjectModel.create(data);
  }

  public async findById(id: string | Types.ObjectId): Promise<IProjectDocument | null> {
    return ProjectModel.findById(id)
      .populate('workspace', 'name slug icon organization')
      .populate('createdBy', 'name username email avatar')
      .exec();
  }

  public async findByWsAndSlug(workspaceId: string | Types.ObjectId, slug: string): Promise<IProjectDocument | null> {
    return ProjectModel.findOne({ workspace: workspaceId, slug: slug.toLowerCase() }).exec();
  }

  public async findWorkspaceProjects(
    workspaceId: string | Types.ObjectId,
    includeArchived = false
  ): Promise<IProjectDocument[]> {
    const filter: Record<string, unknown> = { workspace: workspaceId };
    if (!includeArchived) {
      filter.isArchived = false;
    }
    return ProjectModel.find(filter)
      .populate('createdBy', 'name username email avatar')
      .sort({ updatedAt: -1 })
      .exec();
  }

  public async update(id: string | Types.ObjectId, data: Partial<IProjectDocument>): Promise<IProjectDocument | null> {
    return ProjectModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  public async archive(id: string | Types.ObjectId): Promise<IProjectDocument | null> {
    return ProjectModel.findByIdAndUpdate(id, { isArchived: true, status: ProjectStatus.ARCHIVED }, { new: true }).exec();
  }

  public async restore(id: string | Types.ObjectId): Promise<IProjectDocument | null> {
    return ProjectModel.findByIdAndUpdate(id, { isArchived: false, status: ProjectStatus.ACTIVE }, { new: true }).exec();
  }
}

export const projectRepository = new ProjectRepository();
