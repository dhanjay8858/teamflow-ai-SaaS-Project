import { Request, Response, NextFunction } from 'express';
import { taskService, TaskService } from '../services/task.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';
import { TaskStatus, TaskPriority } from '../types/task.types.js';

export class TaskController {
  constructor(private service: TaskService = taskService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const task = await this.service.createTask(req.user.userId, req.body);
      return ApiResponse.created({
        res,
        message: 'Task created successfully',
        data: { task },
      });
    } catch (error) {
      return next(error);
    }
  };

  public getTasks = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const boardId = req.query.boardId as string;
      const projectId = req.query.projectId as string;
      const includeArchived = req.query.includeArchived === 'true';

      if (boardId) {
        const tasks = await this.service.getBoardTasks(req.user.userId, boardId, includeArchived);
        return ApiResponse.success({ res, data: { tasks } });
      }

      if (projectId) {
        const query = (req.query.q || req.query.search) as string;
        if (query) {
          const tasks = await this.service.searchTasks(req.user.userId, projectId, query, {
            status: req.query.status as TaskStatus,
            priority: req.query.priority as TaskPriority,
            assigneeId: req.query.assigneeId as string,
          });
          return ApiResponse.success({ res, data: { tasks } });
        }

        const tasks = await this.service.getProjectTasks(req.user.userId, projectId, includeArchived);
        return ApiResponse.success({ res, data: { tasks } });
      }

      throw AppError.badRequest('Either boardId or projectId query parameter is required');
    } catch (error) {
      return next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const task = await this.service.getTaskById(req.user.userId, req.params.id);
      return ApiResponse.success({
        res,
        data: { task },
      });
    } catch (error) {
      return next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const task = await this.service.updateTask(req.user.userId, req.params.id, req.body);
      return ApiResponse.success({
        res,
        message: 'Task updated successfully',
        data: { task },
      });
    } catch (error) {
      return next(error);
    }
  };

  public archive = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      await this.service.archiveTask(req.user.userId, req.params.id);
      return ApiResponse.success({
        res,
        message: 'Task archived successfully',
      });
    } catch (error) {
      return next(error);
    }
  };

  public move = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const task = await this.service.moveTask(req.user.userId, req.body);
      return ApiResponse.success({
        res,
        message: 'Task moved successfully',
        data: { task },
      });
    } catch (error) {
      return next(error);
    }
  };

  public assign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const task = await this.service.assignTask(req.user.userId, req.body.taskId, req.body.assigneeId);
      return ApiResponse.success({
        res,
        message: 'Task assignee updated',
        data: { task },
      });
    } catch (error) {
      return next(error);
    }
  };

  public changeStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const task = await this.service.changeStatus(req.user.userId, req.body.taskId, req.body.status);
      return ApiResponse.success({
        res,
        message: 'Task status updated',
        data: { task },
      });
    } catch (error) {
      return next(error);
    }
  };

  public changePriority = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const task = await this.service.changePriority(req.user.userId, req.body.taskId, req.body.priority);
      return ApiResponse.success({
        res,
        message: 'Task priority updated',
        data: { task },
      });
    } catch (error) {
      return next(error);
    }
  };

  public updateLabels = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const task = await this.service.updateLabels(req.user.userId, req.body.taskId, req.body.labels);
      return ApiResponse.success({
        res,
        message: 'Task labels updated',
        data: { task },
      });
    } catch (error) {
      return next(error);
    }
  };

  // --- RICH TASK FEATURES CONTROLLERS ---

  // Checklist
  public getChecklist = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();
      const taskId = req.query.taskId as string;
      if (!taskId) throw AppError.badRequest('taskId query parameter is required');

      const items = await this.service.getTaskChecklist(req.user.userId, taskId);
      return ApiResponse.success({ res, data: { items } });
    } catch (error) {
      return next(error);
    }
  };

  public createChecklistItem = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const item = await this.service.createChecklistItem(req.user.userId, req.body.taskId, req.body.text);
      return ApiResponse.created({ res, message: 'Checklist item added', data: { item } });
    } catch (error) {
      return next(error);
    }
  };

  public updateChecklistItem = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const item = await this.service.updateChecklistItem(req.user.userId, req.params.itemId, req.body);
      return ApiResponse.success({ res, message: 'Checklist item updated', data: { item } });
    } catch (error) {
      return next(error);
    }
  };

  public deleteChecklistItem = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      await this.service.deleteChecklistItem(req.user.userId, req.params.itemId);
      return ApiResponse.success({ res, message: 'Checklist item deleted' });
    } catch (error) {
      return next(error);
    }
  };

  // Subtasks
  public createSubtask = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const task = await this.service.createTask(req.user.userId, {
        boardId: req.body.boardId,
        title: req.body.title,
        descriptionPreview: req.body.descriptionPreview,
        parentTaskId: req.body.parentTaskId,
      });

      return ApiResponse.created({ res, message: 'Subtask created successfully', data: { task } });
    } catch (error) {
      return next(error);
    }
  };

  // Dependencies
  public getDependencies = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();
      const taskId = req.query.taskId as string;
      if (!taskId) throw AppError.badRequest('taskId query parameter is required');

      const dependencies = await this.service.getTaskDependencies(req.user.userId, taskId);
      return ApiResponse.success({ res, data: { dependencies } });
    } catch (error) {
      return next(error);
    }
  };

  public createDependency = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const dependency = await this.service.createDependency(req.user.userId, req.body.taskId, req.body.dependsOnId);
      return ApiResponse.created({ res, message: 'Dependency added', data: { dependency } });
    } catch (error) {
      return next(error);
    }
  };

  public deleteDependency = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      await this.service.deleteDependency(req.user.userId, req.params.depId);
      return ApiResponse.success({ res, message: 'Dependency removed' });
    } catch (error) {
      return next(error);
    }
  };

  // Time Tracking
  public updateTimeTracking = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const task = await this.service.updateTimeTracking(
        req.user.userId,
        req.body.taskId,
        req.body.estimateMinutes,
        req.body.spentMinutes
      );
      return ApiResponse.success({ res, message: 'Time tracking updated', data: { task } });
    } catch (error) {
      return next(error);
    }
  };

  // --- TASK COLLABORATION CONTROLLERS (Phase 06C) ---

  // Watchers
  public watchTask = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const watcher = await this.service.watchTask(req.user.userId, req.body.taskId);
      return ApiResponse.created({ res, message: 'You are now watching this task', data: { watcher } });
    } catch (error) {
      return next(error);
    }
  };

  public unwatchTask = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      await this.service.unwatchTask(req.user.userId, req.params.taskId);
      return ApiResponse.success({ res, message: 'Unwatched task' });
    } catch (error) {
      return next(error);
    }
  };

  public getWatchers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();
      const taskId = req.params.taskId;

      const data = await this.service.getTaskWatchers(req.user.userId, taskId);
      return ApiResponse.success({ res, data });
    } catch (error) {
      return next(error);
    }
  };

  // Task History
  public getHistory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();
      const taskId = req.query.taskId as string;
      if (!taskId) throw AppError.badRequest('taskId query parameter is required');

      const history = await this.service.getTaskHistory(req.user.userId, taskId);
      return ApiResponse.success({ res, data: { history } });
    } catch (error) {
      return next(error);
    }
  };

  // Recently Viewed Tasks
  public getRecentlyViewed = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const recentTasks = await this.service.getRecentlyViewed(req.user.userId);
      return ApiResponse.success({ res, data: { recentTasks } });
    } catch (error) {
      return next(error);
    }
  };
}

export const taskController = new TaskController();
