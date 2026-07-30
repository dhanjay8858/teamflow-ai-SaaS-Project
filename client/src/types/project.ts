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

export interface Project {
  _id: string;
  workspace: {
    _id: string;
    name: string;
    slug: string;
  };
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  color?: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  createdBy: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  startDate?: string | null;
  targetDate?: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  _id: string;
  project: string;
  user: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  role: ProjectMemberRole;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  workspaceId: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  visibility?: ProjectVisibility;
  startDate?: string;
  targetDate?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  startDate?: string;
  targetDate?: string;
}
