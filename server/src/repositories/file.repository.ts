import { FileModel, IFileDocument } from '../models/file.model.js';
import { Types } from 'mongoose';

export interface CreateFileData {
  workspace: Types.ObjectId | string;
  project?: Types.ObjectId | string | null;
  task?: Types.ObjectId | string | null;
  uploadedBy: Types.ObjectId | string;
  originalName: string;
  displayName: string;
  mimeType: string;
  extension: string;
  size: number;
  cloudinaryPublicId: string;
  url: string;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
}

export class FileRepository {
  public async create(data: CreateFileData): Promise<IFileDocument> {
    return FileModel.create(data);
  }

  public async findById(id: string | Types.ObjectId): Promise<IFileDocument | null> {
    return FileModel.findOne({ _id: id, isDeleted: false })
      .populate('uploadedBy', 'name username avatar')
      .exec();
  }

  public async findByTaskId(taskId: string | Types.ObjectId): Promise<IFileDocument[]> {
    return FileModel.find({ task: taskId, isDeleted: false })
      .populate('uploadedBy', 'name username avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  public async findByProjectId(projectId: string | Types.ObjectId): Promise<IFileDocument[]> {
    return FileModel.find({ project: projectId, isDeleted: false })
      .populate('uploadedBy', 'name username avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  public async findByWorkspaceId(workspaceId: string | Types.ObjectId, limit = 50): Promise<IFileDocument[]> {
    return FileModel.find({ workspace: workspaceId, isDeleted: false })
      .populate('uploadedBy', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  public async update(id: string | Types.ObjectId, data: Partial<IFileDocument>): Promise<IFileDocument | null> {
    return FileModel.findByIdAndUpdate(id, { ...data, $inc: { version: 1 } }, { new: true }).exec();
  }

  public async softDelete(id: string | Types.ObjectId): Promise<IFileDocument | null> {
    return FileModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
  }

  public async restore(id: string | Types.ObjectId): Promise<IFileDocument | null> {
    return FileModel.findByIdAndUpdate(id, { isDeleted: false }, { new: true }).exec();
  }

  public async findDeletedById(id: string | Types.ObjectId): Promise<IFileDocument | null> {
    return FileModel.findById(id).populate('uploadedBy', 'name username avatar').exec();
  }
}

export const fileRepository = new FileRepository();
