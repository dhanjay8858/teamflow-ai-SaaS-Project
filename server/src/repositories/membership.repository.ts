import { MembershipModel } from '../models/membership.model.js';
import { IMembershipDocument, MembershipRole, MembershipStatus } from '../types/organization.types.js';
import { Types } from 'mongoose';

export class MembershipRepository {
  public async create(data: Partial<IMembershipDocument>): Promise<IMembershipDocument> {
    return MembershipModel.create(data);
  }

  public async findById(id: string | Types.ObjectId): Promise<IMembershipDocument | null> {
    return MembershipModel.findById(id).populate('user', 'name username email avatar').exec();
  }

  public async findByUserAndWorkspace(userId: string | Types.ObjectId, workspaceId: string | Types.ObjectId): Promise<IMembershipDocument | null> {
    return MembershipModel.findOne({ user: userId, workspace: workspaceId, status: MembershipStatus.ACTIVE }).exec();
  }

  public async findWorkspaceMembers(workspaceId: string | Types.ObjectId): Promise<IMembershipDocument[]> {
    return MembershipModel.find({ workspace: workspaceId, status: MembershipStatus.ACTIVE })
      .populate('user', 'name username email avatar role')
      .exec();
  }

  public async findUserWorkspaceMemberships(userId: string | Types.ObjectId): Promise<IMembershipDocument[]> {
    return MembershipModel.find({ user: userId, status: MembershipStatus.ACTIVE })
      .populate('organization', 'name slug logo')
      .populate('workspace', 'name slug icon visibility isDefault')
      .exec();
  }

  public async updateRole(id: string | Types.ObjectId, role: MembershipRole): Promise<IMembershipDocument | null> {
    return MembershipModel.findByIdAndUpdate(id, { role }, { new: true }).exec();
  }

  public async removeMember(id: string | Types.ObjectId): Promise<IMembershipDocument | null> {
    return MembershipModel.findByIdAndUpdate(id, { status: MembershipStatus.REMOVED }, { new: true }).exec();
  }
}

export const membershipRepository = new MembershipRepository();
