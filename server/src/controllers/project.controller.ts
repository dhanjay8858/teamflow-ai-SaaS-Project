import { Request, Response, NextFunction } from 'express';
import { projectService, ProjectService } from '../services/project.service.js';
import { projectMemberService, ProjectMemberService } from '../services/projectMember.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export class ProjectController {
  constructor(
    private service: ProjectService = projectService,
    private memberService: ProjectMemberService = projectMemberService
  ) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const project = await this.service.createProject(req.user.userId, req.body);
      return ApiResponse.created({
        res,
        message: 'Project created successfully',
        data: { project },
      });
    } catch (error) {
      return next(error);
    }
  };

  public getWorkspaceProjects = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();
      const workspaceId = (req.query.workspaceId || req.params.workspaceId) as string;
      if (!workspaceId) throw AppError.badRequest('workspaceId query parameter is required');

      const includeArchived = req.query.includeArchived === 'true';

      const projects = await this.service.getWorkspaceProjects(req.user.userId, workspaceId, includeArchived);
      return ApiResponse.success({
        res,
        data: { projects },
      });
    } catch (error) {
      return next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const project = await this.service.getProjectById(req.user.userId, req.params.id);
      return ApiResponse.success({
        res,
        data: { project },
      });
    } catch (error) {
      return next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const project = await this.service.updateProject(req.user.userId, req.params.id, req.body);
      return ApiResponse.success({
        res,
        message: 'Project updated successfully',
        data: { project },
      });
    } catch (error) {
      return next(error);
    }
  };

  public archive = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      await this.service.archiveProject(req.user.userId, req.params.id);
      return ApiResponse.success({
        res,
        message: 'Project archived successfully',
      });
    } catch (error) {
      return next(error);
    }
  };

  // Member Management Controllers
  public getMembers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const members = await this.memberService.getProjectMembers(req.params.id);
      return ApiResponse.success({
        res,
        data: { members },
      });
    } catch (error) {
      return next(error);
    }
  };

  public addMember = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const member = await this.memberService.addMember(
        req.user.userId,
        req.params.id,
        req.body.userId,
        req.body.role
      );
      return ApiResponse.created({
        res,
        message: 'Project member added successfully',
        data: { member },
      });
    } catch (error) {
      return next(error);
    }
  };

  public updateMemberRole = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const member = await this.memberService.updateRole(
        req.user.userId,
        req.params.id,
        req.params.memberId,
        req.body.role
      );
      return ApiResponse.success({
        res,
        message: 'Project member role updated successfully',
        data: { member },
      });
    } catch (error) {
      return next(error);
    }
  };

  public removeMember = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      await this.memberService.removeMember(req.user.userId, req.params.id, req.params.memberId);
      return ApiResponse.success({
        res,
        message: 'Project member removed successfully',
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const projectController = new ProjectController();
