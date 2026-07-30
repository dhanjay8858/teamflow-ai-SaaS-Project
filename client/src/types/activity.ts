export enum DomainEventType {
  USER_REGISTERED = 'UserRegistered',
  USER_LOGGED_IN = 'UserLoggedIn',
  USER_LOGGED_OUT = 'UserLoggedOut',
  ORGANIZATION_CREATED = 'OrganizationCreated',
  ORGANIZATION_UPDATED = 'OrganizationUpdated',
  WORKSPACE_CREATED = 'WorkspaceCreated',
  WORKSPACE_UPDATED = 'WorkspaceUpdated',
  WORKSPACE_SWITCHED = 'WorkspaceSwitched',
  INVITATION_CREATED = 'InvitationCreated',
  INVITATION_ACCEPTED = 'InvitationAccepted',
  INVITATION_DECLINED = 'InvitationDeclined',
  MEMBERSHIP_ADDED = 'MembershipAdded',
  MEMBERSHIP_REMOVED = 'MembershipRemoved',
  ROLE_CHANGED = 'RoleChanged',
}

export enum ActivityEntityType {
  AUTHENTICATION = 'Authentication',
  ORGANIZATION = 'Organization',
  WORKSPACE = 'Workspace',
  MEMBERSHIP = 'Membership',
  INVITATION = 'Invitation',
  PROJECT = 'Project',
  TASK = 'Task',
  COMMENT = 'Comment',
  FILE = 'File',
}

export interface ActivityItem {
  _id: string;
  organization?: {
    _id: string;
    name: string;
    slug: string;
  };
  workspace?: {
    _id: string;
    name: string;
    slug: string;
  };
  user: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  eventType: DomainEventType;
  entityType: ActivityEntityType;
  entityId: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedActivities {
  activities: ActivityItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ActivityFilterParams {
  workspaceId?: string;
  organizationId?: string;
  eventType?: DomainEventType;
  entityType?: ActivityEntityType;
  page?: number;
  limit?: number;
}
