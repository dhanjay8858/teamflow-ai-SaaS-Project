import { Document, Types } from 'mongoose';
import { MembershipRole } from './organization.types.js';

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface IWorkspaceInvitation {
  _id: Types.ObjectId;
  organization: Types.ObjectId;
  workspace: Types.ObjectId;
  invitedBy: Types.ObjectId;
  invitedUser?: Types.ObjectId | null;
  email: string;
  role: MembershipRole;
  status: InvitationStatus;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date | null;
  declinedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkspaceInvitationDocument extends Omit<IWorkspaceInvitation, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface InvitationCreatedEventPayload {
  invitationId: string;
  email: string;
  rawToken: string;
  role: MembershipRole;
  workspaceId: string;
  organizationId: string;
  invitedByUserId: string;
  expiresAt: Date;
}
