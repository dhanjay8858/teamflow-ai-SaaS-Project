import { Schema, model } from 'mongoose';
import { IWorkspaceDocument, WorkspaceVisibility } from '../types/organization.types.js';

const workspaceSchema = new Schema<IWorkspaceDocument>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      minlength: [2, 'Workspace name must be at least 2 characters long'],
      maxlength: [50, 'Workspace name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Workspace slug is required'],
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    icon: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    visibility: {
      type: String,
      enum: Object.values(WorkspaceVisibility),
      default: WorkspaceVisibility.INTERNAL,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
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

// Slug unique inside organization constraint
workspaceSchema.index({ organization: 1, slug: 1 }, { unique: true });

export const WorkspaceModel = model<IWorkspaceDocument>('Workspace', workspaceSchema);
