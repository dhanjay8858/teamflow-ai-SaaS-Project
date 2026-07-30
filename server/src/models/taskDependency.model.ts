import { Schema, model, Document, Types } from 'mongoose';

export interface ITaskDependency {
  _id: Types.ObjectId;
  task: Types.ObjectId;
  dependsOn: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDependencyDocument extends Omit<ITaskDependency, '_id'>, Document {
  _id: Types.ObjectId;
}

const taskDependencySchema = new Schema<ITaskDependencyDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true,
    },
    dependsOn: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'dependsOn Task reference is required'],
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring no duplicate dependency relationships
taskDependencySchema.index({ task: 1, dependsOn: 1 }, { unique: true });

export const TaskDependencyModel = model<ITaskDependencyDocument>('TaskDependency', taskDependencySchema);
