import { Schema, model } from 'mongoose';
import { IOrganizationDocument } from '../types/organization.types.js';

const organizationSchema = new Schema<IOrganizationDocument>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      minlength: [2, 'Organization name must be at least 2 characters long'],
      maxlength: [50, 'Organization name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Organization slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organization owner is required'],
      index: true,
    },
    membersCount: {
      type: Number,
      default: 1,
    },
    workspaceCount: {
      type: Number,
      default: 1,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const OrganizationModel = model<IOrganizationDocument>('Organization', organizationSchema);
