import { ProjectMemberModel } from '../models/projectMember.model.js';
import { IProjectMemberDocument, ProjectMemberRole } from '../types/project.types.js';
import { Types } from 'mongoose';

export class ProjectMemberRepository {
  public async create(data: Partial<IProjectMemberDocument>): Promise<IProjectMemberDocument> {
    return ProjectMemberModel.create(data);
  }

  public async findById(id: string | Types.ObjectId): Promise<IProjectMemberDocument | null> {
    return ProjectMemberModel.findById(id).populate('user', 'name username email avatar').exec();
  }

  public async findByProjectAndUser(
    projectId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<IProjectMemberDocument | null> {
    return ProjectMemberModel.findOne({ project: projectId, user: userId }).exec();
  }

  public async findProjectMembers(projectId: string | Types.ObjectId): Promise<IProjectMemberDocument[]> {
    return ProjectMemberModel.find({ project: projectId })
      .populate('user', 'name username email avatar role')
      .sort({ joinedAt: 1 })
      .exec();
  }

  public async updateRole(id: string | Types.ObjectId, role: ProjectMemberRole): Promise<IProjectMemberDocument | null> {
    return ProjectMemberModel.findByIdAndUpdate(id, { role }, { new: true }).exec();
  }

  public async removeMember(id: string | Types.ObjectId): Promise<IProjectMemberDocument | null> {
    return ProjectMemberModel.findByIdAndDelete(id).exec();
  }
}

export const projectMemberRepository = new ProjectMemberRepository();
