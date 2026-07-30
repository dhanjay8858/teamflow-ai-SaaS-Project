import { WorkspaceModel } from '../models/workspace.model.js';
import { IWorkspaceDocument } from '../types/organization.types.js';
import { Types } from 'mongoose';

export class WorkspaceRepository {
  public async create(data: Partial<IWorkspaceDocument>): Promise<IWorkspaceDocument> {
    return WorkspaceModel.create(data);
  }

  public async findById(id: string | Types.ObjectId): Promise<IWorkspaceDocument | null> {
    return WorkspaceModel.findById(id).exec();
  }

  public async findByOrgAndSlug(orgId: string | Types.ObjectId, slug: string): Promise<IWorkspaceDocument | null> {
    return WorkspaceModel.findOne({ organization: orgId, slug: slug.toLowerCase() }).exec();
  }

  public async findOrgWorkspaces(orgId: string | Types.ObjectId): Promise<IWorkspaceDocument[]> {
    return WorkspaceModel.find({ organization: orgId, isArchived: false }).exec();
  }

  public async findDefaultWorkspace(orgId: string | Types.ObjectId): Promise<IWorkspaceDocument | null> {
    return WorkspaceModel.findOne({ organization: orgId, isDefault: true, isArchived: false }).exec();
  }

  public async update(id: string | Types.ObjectId, data: Partial<IWorkspaceDocument>): Promise<IWorkspaceDocument | null> {
    return WorkspaceModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  public async archive(id: string | Types.ObjectId): Promise<IWorkspaceDocument | null> {
    return WorkspaceModel.findByIdAndUpdate(id, { isArchived: true }, { new: true }).exec();
  }
}

export const workspaceRepository = new WorkspaceRepository();
