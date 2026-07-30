import { Request, Response, NextFunction } from 'express';
import { taskAssistantService, TaskAssistantService } from '../services/taskAssistant.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { AppError } from '../../utils/appError.js';

export class TaskAssistantController {
  constructor(private service: TaskAssistantService = taskAssistantService) {}

  public executeAction = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const { workspaceId, taskId, action } = req.body;
      if (!workspaceId || !taskId || !action) {
        throw AppError.badRequest('workspaceId, taskId, and action are required');
      }

      const result = await this.service.executeAction(req.user.userId, workspaceId, taskId, action);
      return ApiResponse.success({ res, message: `Task AI action ${action} executed`, data: result });
    } catch (error) {
      return next(error);
    }
  };

  public streamAction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const { workspaceId, taskId, action } = req.body;
      if (!workspaceId || !taskId || !action) {
        throw AppError.badRequest('workspaceId, taskId, and action are required');
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await this.service.streamAction(
        req.user.userId,
        workspaceId,
        taskId,
        action,
        (chunk) => {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
      );

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      return next(error);
    }
  };
}

export const taskAssistantController = new TaskAssistantController();
