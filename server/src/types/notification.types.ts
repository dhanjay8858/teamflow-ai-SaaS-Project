import { Document, Types } from 'mongoose';

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

export interface INotification {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  actor: Types.ObjectId;
  workspace?: Types.ObjectId | null;
  project?: Types.ObjectId | null;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationDocument extends Omit<INotification, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface CreateNotificationInput {
  recipient: string | Types.ObjectId;
  actor: string | Types.ObjectId;
  workspace?: string | Types.ObjectId | null;
  project?: string | Types.ObjectId | null;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface CursorPaginatedNotifications {
  notifications: INotificationDocument[];
  nextCursor: string | null;
  hasMore: boolean;
}
