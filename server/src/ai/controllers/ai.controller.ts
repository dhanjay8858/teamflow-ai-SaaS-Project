import { Request, Response, NextFunction } from 'express';
import { aiService, AIService } from '../services/ai.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { AppError } from '../../utils/appError.js';

export class AIController {
  constructor(private service: AIService = aiService) {}

  public getHealth = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const health = await this.service.getHealth();
      return ApiResponse.success({ res, data: health });
    } catch (error) {
      return next(error);
    }
  };

  public getProviders = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const providers = await this.service.getProviders();
      return ApiResponse.success({ res, data: providers });
    } catch (error) {
      return next(error);
    }
  };

  public processQuery = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const { prompt, workspaceId, projectId, taskId } = req.body;
      const result = await this.service.processQuery(
        req.user.userId,
        prompt,
        workspaceId,
        projectId,
        taskId
      );

      return ApiResponse.success({ res, message: 'AI Query Processed', data: result });
    } catch (error) {
      return next(error);
    }
  };

  public streamQuery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const { prompt, workspaceId, projectId, taskId } = req.body;

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await this.service.streamQuery(
        req.user.userId,
        prompt,
        workspaceId,
        (chunk) => {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        },
        projectId,
        taskId
      );

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      return next(error);
    }
  };

  public embedTest = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { text } = req.body;
      const result = await this.service.testEmbedding(text);
      return ApiResponse.success({ res, message: 'Embedding Test Successful', data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export const aiController = new AIController();
