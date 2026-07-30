import { Schema, model, Document, Types } from 'mongoose';

export interface ITaskHistory {
  _id: Types.ObjectId;
  task: Types.ObjectId;
  user: Types.ObjectId;
  eventType: string;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface ITaskHistoryDocument extends Omit<ITaskHistory, '_id'>, Document {
  _id: Types.ObjectId;
}

const taskHistorySchema = new Schema<ITaskHistoryDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      trim: true,
    },
    field: {
      type: String,
      default: '',
    },
    oldValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

taskHistorySchema.index({ task: 1, createdAt: -1 });

export const TaskHistoryModel = model<ITaskHistoryDocument>('TaskHistory', taskHistorySchema);
