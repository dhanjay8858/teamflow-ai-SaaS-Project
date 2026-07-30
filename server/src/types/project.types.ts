import { Document, Types } from 'mongoose';

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum ProjectVisibility {
  PRIVATE = 'PRIVATE',
  WORKSPACE = 'WORKSPACE',
}

export enum ProjectMemberRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER',
}

export interface IProject {
  _id: Types.ObjectId;
  workspace: Types.ObjectId;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  color?: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  createdBy: Types.ObjectId;
  startDate?: Date | null;
  targetDate?: Date | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDocument extends Omit<IProject, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface IProjectMember {
  _id: Types.ObjectId;
  project: Types.ObjectId;
  user: Types.ObjectId;
  role: ProjectMemberRole;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectMemberDocument extends Omit<IProjectMember, '_id'>, Document {
  _id: Types.ObjectId;
}
