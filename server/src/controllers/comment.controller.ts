import { Request, Response, NextFunction } from 'express';
import { commentService, CommentService } from '../services/comment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export class CommentController {
  constructor(private service: CommentService = commentService) {}

  public getTaskComments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const taskId = req.params.taskId;
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 100);

      const result = await this.service.getTaskComments(req.user.userId, taskId, page, limit);

      return ApiResponse.success({
        res,
        data: result,
        meta: { page, limit, total: result.total },
      });
    } catch (error) {
      return next(error);
    }
  };

  public createComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const comment = await this.service.createComment(req.user.userId, {
        taskId: req.body.taskId,
        markdown: req.body.markdown,
        attachmentIds: req.body.attachmentIds,
      });

      return ApiResponse.created({ res, message: 'Comment created', data: { comment } });
    } catch (error) {
      return next(error);
    }
  };

  public createReply = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const reply = await this.service.createReply(req.user.userId, {
        parentCommentId: req.params.id,
        taskId: req.body.taskId,
        markdown: req.body.markdown,
        attachmentIds: req.body.attachmentIds,
      });

      return ApiResponse.created({ res, message: 'Reply created', data: { comment: reply } });
    } catch (error) {
      return next(error);
    }
  };

  public updateComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const comment = await this.service.updateComment(req.user.userId, req.params.id, {
        markdown: req.body.markdown,
        attachmentIds: req.body.attachmentIds,
      });

      return ApiResponse.success({ res, message: 'Comment updated', data: { comment } });
    } catch (error) {
      return next(error);
    }
  };

  public deleteComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();
      await this.service.deleteComment(req.user.userId, req.params.id);
      return ApiResponse.success({ res, message: 'Comment deleted' });
    } catch (error) {
      return next(error);
    }
  };

  public restoreComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const comment = await this.service.restoreComment(
        req.user.userId,
        req.params.id,
        req.body.originalMarkdown
      );

      return ApiResponse.success({ res, message: 'Comment restored', data: { comment } });
    } catch (error) {
      return next(error);
    }
  };

  public addReaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const reaction = await this.service.addReaction(
        req.user.userId,
        req.params.id,
        req.body.emoji
      );

      return ApiResponse.created({ res, message: 'Reaction added', data: { reaction } });
    } catch (error) {
      return next(error);
    }
  };

  public removeReaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      await this.service.removeReaction(req.user.userId, req.params.id, req.body.emoji);
      return ApiResponse.success({ res, message: 'Reaction removed' });
    } catch (error) {
      return next(error);
    }
  };

  public getReactions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const reactions = await this.service.getCommentReactions(req.user.userId, req.params.id);
      return ApiResponse.success({ res, data: { reactions } });
    } catch (error) {
      return next(error);
    }
  };
}

export const commentController = new CommentController();
