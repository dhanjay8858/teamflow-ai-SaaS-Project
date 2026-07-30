import { WorkspaceInvitationModel } from '../models/invitation.model.js';
import { IWorkspaceInvitationDocument, InvitationStatus } from '../types/invitation.types.js';
import { Types } from 'mongoose';

export class WorkspaceInvitationRepository {
  public async create(data: Partial<IWorkspaceInvitationDocument>): Promise<IWorkspaceInvitationDocument> {
    return WorkspaceInvitationModel.create(data);
  }

  public async findById(id: string | Types.ObjectId, includeToken = false): Promise<IWorkspaceInvitationDocument | null> {
    const query = WorkspaceInvitationModel.findById(id);
    if (includeToken) query.select('+token');
    return query
      .populate('workspace', 'name slug icon')
      .populate('organization', 'name slug logo')
      .populate('invitedBy', 'name username email avatar')
      .exec();
  }

  public async findByHashedToken(hashedToken: string): Promise<IWorkspaceInvitationDocument | null> {
    return WorkspaceInvitationModel.findOne({ token: hashedToken })
      .select('+token')
      .populate('workspace', 'name slug icon')
      .populate('organization', 'name slug logo')
      .populate('invitedBy', 'name username email avatar')
      .exec();
  }

  public async findActivePendingInvitation(workspaceId: string | Types.ObjectId, email: string): Promise<IWorkspaceInvitationDocument | null> {
    return WorkspaceInvitationModel.findOne({
      workspace: workspaceId,
      email: email.toLowerCase(),
      status: InvitationStatus.PENDING,
      expiresAt: { $gt: new Date() },
    }).exec();
  }

  public async findWorkspacePendingInvitations(workspaceId: string | Types.ObjectId): Promise<IWorkspaceInvitationDocument[]> {
    return WorkspaceInvitationModel.find({
      workspace: workspaceId,
      status: InvitationStatus.PENDING,
    })
      .populate('invitedBy', 'name username email avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  public async updateStatus(
    id: string | Types.ObjectId,
    status: InvitationStatus,
    extraFields: { acceptedAt?: Date; declinedAt?: Date } = {}
  ): Promise<IWorkspaceInvitationDocument | null> {
    return WorkspaceInvitationModel.findByIdAndUpdate(
      id,
      { status, ...extraFields },
      { new: true }
    ).exec();
  }

  public async updateTokenAndExpiry(
    id: string | Types.ObjectId,
    hashedToken: string,
    expiresAt: Date
  ): Promise<IWorkspaceInvitationDocument | null> {
    return WorkspaceInvitationModel.findByIdAndUpdate(
      id,
      { token: hashedToken, expiresAt, status: InvitationStatus.PENDING },
      { new: true }
    ).exec();
  }
}

export const workspaceInvitationRepository = new WorkspaceInvitationRepository();
