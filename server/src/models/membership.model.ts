import { Schema, model } from 'mongoose';
import { IMembershipDocument, MembershipRole, MembershipStatus } from '../types/organization.types.js';

const membershipSchema = new Schema<IMembershipDocument>(
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
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(MembershipRole),
      default: MembershipRole.MEMBER,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(MembershipStatus),
      default: MembershipStatus.ACTIVE,
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index enforcing one user membership per workspace
membershipSchema.index({ user: 1, workspace: 1 }, { unique: true });

export const MembershipModel = model<IMembershipDocument>('Membership', membershipSchema);
