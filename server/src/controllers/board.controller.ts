import { Request, Response, NextFunction } from 'express';
import { boardService, BoardService } from '../services/board.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export class BoardController {
  constructor(private service: BoardService = boardService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const board = await this.service.createBoard(req.user.userId, req.body);
      return ApiResponse.created({
        res,
        message: 'Kanban board created successfully',
        data: { board },
      });
    } catch (error) {
      return next(error);
    }
  };

  public getProjectBoards = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();
      const projectId = (req.query.projectId || req.params.projectId) as string;
      if (!projectId) throw AppError.badRequest('projectId query parameter is required');

      const includeArchived = req.query.includeArchived === 'true';

      const boards = await this.service.getProjectBoards(req.user.userId, projectId, includeArchived);
      return ApiResponse.success({
        res,
        data: { boards },
      });
    } catch (error) {
      return next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const board = await this.service.getBoardById(req.user.userId, req.params.id);
      return ApiResponse.success({
        res,
        data: { board },
      });
    } catch (error) {
      return next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const board = await this.service.updateBoard(req.user.userId, req.params.id, req.body);
      return ApiResponse.success({
        res,
        message: 'Board updated successfully',
        data: { board },
      });
    } catch (error) {
      return next(error);
    }
  };

  public archive = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      await this.service.archiveBoard(req.user.userId, req.params.id);
      return ApiResponse.success({
        res,
        message: 'Board archived successfully',
      });
    } catch (error) {
      return next(error);
    }
  };

  public reorder = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      await this.service.reorderBoards(req.user.userId, req.body.projectId, req.body.boards);
      return ApiResponse.success({
        res,
        message: 'Board column positions reordered successfully',
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const boardController = new BoardController();
