import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../types/task.types.js';

export const createTaskSchema = z.object({
  body: z.object({
    boardId: z.string().min(1, 'Board ID is required'),
    title: z.string().min(2, 'Title must be at least 2 characters long').max(150).trim(),
    descriptionPreview: z.string().max(1000).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assigneeId: z.string().optional(),
    labels: z.array(z.string().max(30)).max(10).optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    title: z.string().min(2).max(150).trim().optional(),
    descriptionPreview: z.string().max(1000).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assigneeId: z.string().nullable().optional(),
    labels: z.array(z.string().max(30)).max(10).optional(),
    startDate: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
  }),
});

export const moveTaskSchema = z.object({
  body: z.object({
    taskId: z.string().min(1, 'taskId is required'),
    targetBoardId: z.string().min(1, 'targetBoardId is required'),
    newPosition: z.number().int().min(1).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
  }),
});

export const assignTaskSchema = z.object({
  body: z.object({
    taskId: z.string().min(1, 'taskId is required'),
    assigneeId: z.string().nullable(),
  }),
});

export const taskStatusSchema = z.object({
  body: z.object({
    taskId: z.string().min(1, 'taskId is required'),
    status: z.nativeEnum(TaskStatus),
  }),
});

export const taskPrioritySchema = z.object({
  body: z.object({
    taskId: z.string().min(1, 'taskId is required'),
    priority: z.nativeEnum(TaskPriority),
  }),
});

export const taskLabelsSchema = z.object({
  body: z.object({
    taskId: z.string().min(1, 'taskId is required'),
    labels: z.array(z.string().max(30)).max(10),
  }),
});
