import { Schema, model } from 'mongoose';
import { IActivityDocument, DomainEventType, ActivityEntityType } from '../types/activity.types.js';

const activitySchema = new Schema<IActivityDocument>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required for activity log'],
      index: true,
    },
    eventType: {
      type: String,
      enum: Object.values(DomainEventType),
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: Object.values(ActivityEntityType),
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast timeline queries and ordering
activitySchema.index({ workspace: 1, createdAt: -1 });
activitySchema.index({ organization: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

export const ActivityModel = model<IActivityDocument>('Activity', activitySchema);
