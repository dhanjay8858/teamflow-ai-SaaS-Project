import { Request, Response, NextFunction } from 'express';
import { notificationService, NotificationService } from '../services/notification.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export class NotificationController {
  constructor(private service: NotificationService = notificationService) {}

  public getNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const limit = Math.min(
        parseInt((req.query.limit as string) || '20', 10),
        50
      );
      const cursor = req.query.cursor as string | undefined;

      const result = await this.service.getNotifications(req.user.userId, limit, cursor);

      return ApiResponse.success({
        res,
        data: result,
        meta: {
          limit,
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  public getUnreadCount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const unreadCount = await this.service.getUnreadCount(req.user.userId);
      return ApiResponse.success({ res, data: { unreadCount } });
    } catch (error) {
      return next(error);
    }
  };

  public markRead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const notification = await this.service.markRead(req.user.userId, req.params.id);
      return ApiResponse.success({ res, message: 'Notification marked as read', data: { notification } });
    } catch (error) {
      return next(error);
    }
  };

  public markAllRead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const result = await this.service.markAllRead(req.user.userId);
      return ApiResponse.success({ res, message: 'All notifications marked as read', data: result });
    } catch (error) {
      return next(error);
    }
  };

  public delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      await this.service.deleteNotification(req.user.userId, req.params.id);
      return ApiResponse.success({ res, message: 'Notification deleted' });
    } catch (error) {
      return next(error);
    }
  };
}

export const notificationController = new NotificationController();
