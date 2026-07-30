import { Schema, model } from 'mongoose';
import {
  INotificationDocument,
  NotificationType,
  NotificationEntityType,
} from '../types/notification.types.js';

const notificationSchema = new Schema<INotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required'],
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification actor is required'],
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: [true, 'Notification type is required'],
    },
    entityType: {
      type: String,
      enum: Object.values(NotificationEntityType),
      required: [true, 'Notification entityType is required'],
    },
    entityId: {
      type: String,
      required: [true, 'Notification entityId is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ workspace: 1, recipient: 1 });

export const NotificationModel = model<INotificationDocument>('Notification', notificationSchema);
