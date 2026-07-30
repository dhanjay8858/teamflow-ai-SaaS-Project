import { Schema, model, Document, Types } from 'mongoose';

export interface ITaskWatcher {
  _id: Types.ObjectId;
  task: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

export interface ITaskWatcherDocument extends Omit<ITaskWatcher, '_id'>, Document {
  _id: Types.ObjectId;
}

const taskWatcherSchema = new Schema<ITaskWatcherDocument>(
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound unique index ensuring one watcher mapping per task-user pair
taskWatcherSchema.index({ task: 1, user: 1 }, { unique: true });

export const TaskWatcherModel = model<ITaskWatcherDocument>('TaskWatcher', taskWatcherSchema);
