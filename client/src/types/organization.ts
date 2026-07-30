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

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  owner: string;
  membersCount: number;
  workspaceCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  _id: string;
  organization: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  visibility: WorkspaceVisibility;
  createdBy: string;
  isDefault: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  _id: string;
  organization: string;
  workspace: string;
  user: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    role: string;
  };
  role: MembershipRole;
  status: MembershipStatus;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationPayload {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

export interface CreateWorkspacePayload {
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  visibility?: WorkspaceVisibility;
}
