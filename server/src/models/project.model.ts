import { Schema, model } from 'mongoose';
import { IProjectDocument, ProjectStatus, ProjectVisibility } from '../types/project.types.js';

const projectSchema = new Schema<IProjectDocument>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters long'],
      maxlength: [80, 'Project name cannot exceed 80 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'folder',
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.ACTIVE,
      required: true,
      index: true,
    },
    visibility: {
      type: String,
      enum: Object.values(ProjectVisibility),
      default: ProjectVisibility.WORKSPACE,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    targetDate: {
      type: Date,
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index enforcing unique project slug per workspace
projectSchema.index({ workspace: 1, slug: 1 }, { unique: true });

export const ProjectModel = model<IProjectDocument>('Project', projectSchema);
