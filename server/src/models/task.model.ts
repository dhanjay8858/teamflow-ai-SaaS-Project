import { Schema, model } from 'mongoose';
import { ITaskDocument, TaskStatus, TaskPriority } from '../types/task.types.js';

const taskSchema = new Schema<ITaskDocument>(
  {
    taskKey: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    taskNumber: {
      type: Number,
      required: true,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Board reference is required'],
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    descriptionPreview: {
      type: String,
      default: '',
      maxlength: [1000, 'Description preview cannot exceed 1000 characters'],
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
      required: true,
      index: true,
    },
    position: {
      type: Number,
      required: true,
      default: 1,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    labels: {
      type: [String],
      default: [],
      validate: [
        (val: string[]) => val.length <= 10,
        'Cannot exceed 10 labels per task',
      ],
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimateMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    spentMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    parentTask: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    subtaskCount: {
      type: Number,
      default: 0,
    },
    dependencyCount: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
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

// Indexes
taskSchema.index({ project: 1, taskNumber: 1 }, { unique: true });
taskSchema.index({ board: 1, position: 1 });
taskSchema.index({ project: 1, status: 1 });

export const TaskModel = model<ITaskDocument>('Task', taskSchema);
