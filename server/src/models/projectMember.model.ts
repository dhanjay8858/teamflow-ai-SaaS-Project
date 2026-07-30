import { Schema, model } from 'mongoose';
import { IProjectMemberDocument, ProjectMemberRole } from '../types/project.types.js';

const projectMemberSchema = new Schema<IProjectMemberDocument>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
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
      enum: Object.values(ProjectMemberRole),
      default: ProjectMemberRole.CONTRIBUTOR,
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

// Compound unique index ensuring one membership per user per project
projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });

export const ProjectMemberModel = model<IProjectMemberDocument>('ProjectMember', projectMemberSchema);
