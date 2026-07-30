import { Document, Types } from 'mongoose';

export enum WorkspaceVisibility {
  PRIVATE = 'PRIVATE',
  INTERNAL = 'INTERNAL',
}

export enum MembershipRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  REMOVED = 'REMOVED',
}

export interface IOrganization {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  owner: Types.ObjectId;
  membersCount: number;
  workspaceCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganizationDocument extends Omit<IOrganization, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface IWorkspace {
  _id: Types.ObjectId;
  organization: Types.ObjectId;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  visibility: WorkspaceVisibility;
  createdBy: Types.ObjectId;
  isDefault: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkspaceDocument extends Omit<IWorkspace, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface IMembership {
  _id: Types.ObjectId;
  organization: Types.ObjectId;
  workspace: Types.ObjectId;
  user: Types.ObjectId;
  role: MembershipRole;
  status: MembershipStatus;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMembershipDocument extends Omit<IMembership, '_id'>, Document {
  _id: Types.ObjectId;
}
