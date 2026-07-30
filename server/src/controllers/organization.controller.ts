import { Request, Response, NextFunction } from 'express';
import { organizationService, OrganizationService } from '../services/organization.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export class OrganizationController {
  constructor(private service: OrganizationService = organizationService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const result = await this.service.createOrganization(req.user.userId, req.body);
      return ApiResponse.created({
        res,
        message: 'Organization created successfully',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  };

  public getUserOrganizations = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const organizations = await this.service.getUserOrganizations(req.user.userId);
      return ApiResponse.success({
        res,
        data: { organizations },
      });
    } catch (error) {
      return next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const organization = await this.service.getOrganizationById(req.params.id);
      return ApiResponse.success({
        res,
        data: { organization },
      });
    } catch (error) {
      return next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      const organization = await this.service.updateOrganization(req.user.userId, req.params.id, req.body);
      return ApiResponse.success({
        res,
        message: 'Organization updated successfully',
        data: { organization },
      });
    } catch (error) {
      return next(error);
    }
  };

  public archive = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) throw AppError.unauthorized();

      await this.service.archiveOrganization(req.user.userId, req.params.id);
      return ApiResponse.success({
        res,
        message: 'Organization archived successfully',
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const organizationController = new OrganizationController();
