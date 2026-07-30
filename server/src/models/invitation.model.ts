import { Schema, model } from 'mongoose';
import { IWorkspaceInvitationDocument, InvitationStatus } from '../types/invitation.types.js';
import { MembershipRole } from '../types/organization.types.js';

const workspaceInvitationSchema = new Schema<IWorkspaceInvitationDocument>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization reference is required'],
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace reference is required'],
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'InvitedBy user reference is required'],
    },
    invitedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    email: {
      type: String,
      required: [true, 'Invitation email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    },
    role: {
      type: String,
      enum: Object.values(MembershipRole),
      default: MembershipRole.MEMBER,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING,
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    declinedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index to enforce active invitation lookup efficiency per workspace
workspaceInvitationSchema.index({ workspace: 1, email: 1, status: 1 });

export const WorkspaceInvitationModel = model<IWorkspaceInvitationDocument>('WorkspaceInvitation', workspaceInvitationSchema);
