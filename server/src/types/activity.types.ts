import { Document, Types } from 'mongoose';

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

  // Project Domain Events
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_ARCHIVED = 'PROJECT_ARCHIVED',
  PROJECT_MEMBER_ADDED = 'PROJECT_MEMBER_ADDED',
  PROJECT_MEMBER_REMOVED = 'PROJECT_MEMBER_REMOVED',
  PROJECT_ROLE_CHANGED = 'PROJECT_ROLE_CHANGED',

  // Board Domain Events
  BOARD_CREATED = 'BOARD_CREATED',
  BOARD_UPDATED = 'BOARD_UPDATED',
  BOARD_ARCHIVED = 'BOARD_ARCHIVED',
  BOARD_REORDERED = 'BOARD_REORDERED',

  // Task Domain Events
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_ARCHIVED = 'TASK_ARCHIVED',
  TASK_MOVED = 'TASK_MOVED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  TASK_PRIORITY_CHANGED = 'TASK_PRIORITY_CHANGED',
  TASK_LABELS_UPDATED = 'TASK_LABELS_UPDATED',

  // Rich Task Feature Events
  CHECKLIST_CREATED = 'CHECKLIST_CREATED',
  CHECKLIST_UPDATED = 'CHECKLIST_UPDATED',
  CHECKLIST_COMPLETED = 'CHECKLIST_COMPLETED',
  SUBTASK_CREATED = 'SUBTASK_CREATED',
  SUBTASK_COMPLETED = 'SUBTASK_COMPLETED',
  DEPENDENCY_CREATED = 'DEPENDENCY_CREATED',
  DEPENDENCY_REMOVED = 'DEPENDENCY_REMOVED',
  TIME_UPDATED = 'TIME_UPDATED',

  // Task Collaboration Domain Events
  TASK_WATCHED = 'TASK_WATCHED',
  TASK_UNWATCHED = 'TASK_UNWATCHED',
  TASK_VIEWED = 'TASK_VIEWED',
  TASK_HISTORY_RECORDED = 'TASK_HISTORY_RECORDED',
  MENTIONS_PARSED = 'MENTIONS_PARSED',

  // File Domain Events
  FILE_UPLOADED = 'FILE_UPLOADED',
  FILE_DELETED = 'FILE_DELETED',
  FILE_RENAMED = 'FILE_RENAMED',
  FILE_RESTORED = 'FILE_RESTORED',

  // Comment Domain Events
  COMMENT_CREATED = 'COMMENT_CREATED',
  COMMENT_UPDATED = 'COMMENT_UPDATED',
  COMMENT_DELETED = 'COMMENT_DELETED',
  COMMENT_RESTORED = 'COMMENT_RESTORED',
  COMMENT_REPLIED = 'COMMENT_REPLIED',
  COMMENT_REACTION_ADDED = 'COMMENT_REACTION_ADDED',
  COMMENT_REACTION_REMOVED = 'COMMENT_REACTION_REMOVED',

  // Notification Lifecycle Events
  NOTIFICATION_CREATED = 'NOTIFICATION_CREATED',
  NOTIFICATION_READ = 'NOTIFICATION_READ',
  NOTIFICATION_DELETED = 'NOTIFICATION_DELETED',
  UNREAD_COUNT_UPDATED = 'UNREAD_COUNT_UPDATED',
}

export enum ActivityEntityType {
  AUTHENTICATION = 'Authentication',
  ORGANIZATION = 'Organization',
  WORKSPACE = 'Workspace',
  MEMBERSHIP = 'Membership',
  INVITATION = 'Invitation',
  PROJECT = 'Project',
  BOARD = 'Board',
  TASK = 'Task',
  COMMENT = 'Comment',
  FILE = 'File',
}

export interface IDomainEvent<T = Record<string, unknown>> {
  id: string;
  eventType: DomainEventType;
  timestamp: Date;
  aggregateId?: string;
  payload: T;
}

export interface IActivity {
  _id: Types.ObjectId;
  organization?: Types.ObjectId | null;
  workspace?: Types.ObjectId | null;
  user: Types.ObjectId;
  eventType: DomainEventType;
  entityType: ActivityEntityType;
  entityId: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityDocument extends Omit<IActivity, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface ActivityFilterQuery {
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  eventType?: DomainEventType;
  entityType?: ActivityEntityType;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
