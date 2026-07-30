export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_MOVED = 'TASK_MOVED',
  COMMENT_CREATED = 'COMMENT_CREATED',
  COMMENT_REPLY = 'COMMENT_REPLY',
  COMMENT_MENTION = 'COMMENT_MENTION',
  FILE_UPLOADED = 'FILE_UPLOADED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_MEMBER_ADDED = 'PROJECT_MEMBER_ADDED',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  WORKSPACE_INVITED = 'WORKSPACE_INVITED',
}

export enum NotificationEntityType {
  TASK = 'TASK',
  COMMENT = 'COMMENT',
  PROJECT = 'PROJECT',
  FILE = 'FILE',
  WORKSPACE = 'WORKSPACE',
  INVITATION = 'INVITATION',
}

export interface NotificationActor {
  _id: string;
  name: string;
  username: string;
  avatar?: string | null;
}

export interface NotificationItemData {
  _id: string;
  recipient: string;
  actor: NotificationActor;
  workspace?: string | null;
  project?: string | null;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotificationsResult {
  notifications: NotificationItemData[];
  nextCursor: string | null;
  hasMore: boolean;
}
