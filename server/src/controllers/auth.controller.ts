import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { getCookieOptions, REFRESH_COOKIE_NAME, ACCESS_COOKIE_NAME } from '../config/cookie.config.js';
import { AppError } from '../utils/appError.js';

export class AuthController {
  constructor(private service: AuthService = authService) {}

  public register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { user, tokens } = await this.service.register(req.body);

      res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, getCookieOptions(true));
      res.cookie(ACCESS_COOKIE_NAME, tokens.accessToken, getCookieOptions(false));

      return ApiResponse.created({
        res,
        message: 'Account registered successfully',
        data: {
          user,
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { user, tokens } = await this.service.login(req.body);

      res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, getCookieOptions(true));
      res.cookie(ACCESS_COOKIE_NAME, tokens.accessToken, getCookieOptions(false));

      return ApiResponse.success({
        res,
        message: 'Logged in successfully',
        data: {
          user,
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const tokenFromCookie = req.cookies[REFRESH_COOKIE_NAME];
      const tokenFromBody = req.body?.refreshToken;
      const refreshToken = tokenFromCookie || tokenFromBody;

      if (!refreshToken) {
        throw AppError.unauthorized('Refresh token is required');
      }

      const { user, tokens } = await this.service.refreshTokens(refreshToken);

      res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, getCookieOptions(true));
      res.cookie(ACCESS_COOKIE_NAME, tokens.accessToken, getCookieOptions(false));

      return ApiResponse.success({
        res,
        message: 'Tokens refreshed successfully',
        data: {
          user,
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (req.user?.userId) {
        await this.service.logout(req.user.userId);
      }

      res.clearCookie(REFRESH_COOKIE_NAME, getCookieOptions(true));
      res.clearCookie(ACCESS_COOKIE_NAME, getCookieOptions(false));

      return ApiResponse.success({
        res,
        message: 'Logged out successfully',
      });
    } catch (error) {
      return next(error);
    }
  };

  public getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized('Unauthorized');
      }

      const user = await this.service.getCurrentUser(req.user.userId);
      return ApiResponse.success({
        res,
        data: { user },
      });
    } catch (error) {
      return next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized('Unauthorized');
      }

      const updatedUser = await this.service.updateProfile(
        req.user.userId,
        req.body,
        req.file?.buffer
      );

      return ApiResponse.success({
        res,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      return next(error);
    }
  };

  public changePassword = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized('Unauthorized');
      }

      await this.service.changePassword(req.user.userId, req.body);

      return ApiResponse.success({
        res,
        message: 'Password changed successfully',
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const authController = new AuthController();
