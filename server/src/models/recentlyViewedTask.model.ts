import { Schema, model, Document, Types } from 'mongoose';

export interface IRecentlyViewedTask {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  task: Types.ObjectId;
  lastViewedAt: Date;
}

export interface IRecentlyViewedTaskDocument extends Omit<IRecentlyViewedTask, '_id'>, Document {
  _id: Types.ObjectId;
}

const recentlyViewedTaskSchema = new Schema<IRecentlyViewedTaskDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true,
    },
    lastViewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

recentlyViewedTaskSchema.index({ user: 1, lastViewedAt: -1 });
recentlyViewedTaskSchema.index({ user: 1, task: 1 }, { unique: true });

export const RecentlyViewedTaskModel = model<IRecentlyViewedTaskDocument>('RecentlyViewedTask', recentlyViewedTaskSchema);
