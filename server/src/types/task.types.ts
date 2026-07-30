import { Document, Types } from 'mongoose';

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface ITask {
  _id: Types.ObjectId;
  taskKey: string;
  taskNumber: number;
  board: Types.ObjectId;
  project: Types.ObjectId;
  workspace: Types.ObjectId;
  title: string;
  descriptionPreview?: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  assignee?: Types.ObjectId | null;
  reporter: Types.ObjectId;
  labels: string[];
  startDate?: Date | null;
  dueDate?: Date | null;
  estimateMinutes: number;
  spentMinutes: number;
  parentTask?: Types.ObjectId | null;
  subtaskCount: number;
  dependencyCount: number;
  isArchived: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends Omit<ITask, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface CreateTaskInput {
  boardId: string;
  title: string;
  descriptionPreview?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  labels?: string[];
  startDate?: string;
  dueDate?: string;
  estimateMinutes?: number;
  parentTaskId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  descriptionPreview?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  labels?: string[];
  startDate?: string | null;
  dueDate?: string | null;
  estimateMinutes?: number;
  spentMinutes?: number;
}

export interface MoveTaskInput {
  taskId: string;
  targetBoardId: string;
  newPosition?: number;
}
