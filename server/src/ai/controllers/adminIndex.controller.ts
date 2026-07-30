import { Request, Response, NextFunction } from 'express';
import { indexingService, IndexingService } from '../services/indexing.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { AppError } from '../../utils/appError.js';

export class AdminIndexController {
  constructor(private service: IndexingService = indexingService) {}

  public rebuildIndex = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { workspaceId } = req.body;
      if (!workspaceId) {
        throw AppError.badRequest('workspaceId is required for rebuild');
      }

      const stats = await this.service.rebuildWorkspaceIndex(workspaceId);
      return ApiResponse.success({
        res,
        message: `Rebuilt workspace vector index for ${workspaceId}`,
        data: stats,
      });
    } catch (error) {
      return next(error);
    }
  };

  public getStatus = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const status = {
        status: 'active',
        eventSubscriber: 'connected',
        autoIndexing: true,
        chunkingStrategy: '800-1000 tokens (150-200 overlap)',
        embeddingModel: 'nomic-embed-text:v1.5',
      };
      return ApiResponse.success({ res, data: status });
    } catch (error) {
      return next(error);
    }
  };

  public getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const workspaceId = req.query.workspaceId as string | undefined;
      const stats = await this.service.getStatistics(workspaceId);
      return ApiResponse.success({ res, data: stats });
    } catch (error) {
      return next(error);
    }
  };
}

export const adminIndexController = new AdminIndexController();
