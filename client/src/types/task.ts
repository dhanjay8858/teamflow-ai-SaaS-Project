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

export interface Task {
  _id: string;
  taskKey: string;
  taskNumber: number;
  board: {
    _id: string;
    name: string;
    slug: string;
    color?: string;
  };
  project: {
    _id: string;
    name: string;
    slug: string;
  };
  workspace: string;
  title: string;
  descriptionPreview?: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  assignee?: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  } | null;
  reporter: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  labels: string[];
  startDate?: string | null;
  dueDate?: string | null;
  estimateMinutes: number;
  spentMinutes: number;
  parentTask?: string | null;
  subtaskCount: number;
  dependencyCount: number;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  _id: string;
  task: string;
  text: string;
  completed: boolean;
  position: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDependency {
  _id: string;
  task: string;
  dependsOn: {
    _id: string;
    taskKey: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee?: {
      name: string;
      avatar?: string;
    };
  };
  createdBy: string;
  createdAt: string;
}

export interface TaskWatcher {
  _id: string;
  task: string;
  user: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface TaskHistory {
  _id: string;
  task: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  eventType: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface RecentlyViewedTask {
  _id: string;
  user: string;
  task: Task;
  lastViewedAt: string;
}

export interface CreateTaskPayload {
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

export interface UpdateTaskPayload {
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
