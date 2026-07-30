import { Request, Response, NextFunction } from 'express';
import { fileService, FileService } from '../services/file.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export class FileController {
  constructor(private service: FileService = fileService) {}

  public upload = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();
      if (!req.file) throw AppError.badRequest('No file was provided in the request');

      const { workspaceId, projectId, taskId } = req.query as {
        workspaceId: string;
        projectId?: string;
        taskId?: string;
      };

      if (!workspaceId) throw AppError.badRequest('workspaceId is required');

      const file = await this.service.uploadFile(req.user.userId, {
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        workspaceId,
        projectId: projectId || undefined,
        taskId: taskId || undefined,
        uploadedBy: req.user.userId,
      });

      return ApiResponse.created({
        res,
        message: 'File uploaded successfully',
        data: { file },
      });
    } catch (error) {
      return next(error);
    }
  };

  public getFile = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const file = await this.service.getFile(req.user.userId, req.params.id);
      return ApiResponse.success({ res, data: { file } });
    } catch (error) {
      return next(error);
    }
  };

  public getTaskFiles = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const files = await this.service.getTaskFiles(req.user.userId, req.params.taskId);
      return ApiResponse.success({ res, data: { files } });
    } catch (error) {
      return next(error);
    }
  };

  public getProjectFiles = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const files = await this.service.getProjectFiles(req.user.userId, req.params.projectId);
      return ApiResponse.success({ res, data: { files } });
    } catch (error) {
      return next(error);
    }
  };

  public getWorkspaceFiles = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const workspaceId = req.params.workspaceId || (req.query.workspaceId as string);
      if (!workspaceId) throw AppError.badRequest('workspaceId is required');

      const files = await this.service.getWorkspaceFiles(req.user.userId, workspaceId);
      return ApiResponse.success({ res, data: { files } });
    } catch (error) {
      return next(error);
    }
  };

  public rename = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const { displayName } = req.body as { displayName: string };
      const file = await this.service.renameFile(req.user.userId, req.params.id, displayName);
      return ApiResponse.success({ res, message: 'File renamed successfully', data: { file } });
    } catch (error) {
      return next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      await this.service.deleteFile(req.user.userId, req.params.id);
      return ApiResponse.success({ res, message: 'File deleted successfully' });
    } catch (error) {
      return next(error);
    }
  };

  public restore = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const file = await this.service.restoreFile(req.user.userId, req.params.id);
      return ApiResponse.success({ res, message: 'File restored successfully', data: { file } });
    } catch (error) {
      return next(error);
    }
  };
}

export const fileController = new FileController();
