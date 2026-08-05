import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { IUserDocument, SanitizedUser, AuthTokens, JwtAccessPayload, JwtRefreshPayload } from '../types/auth.types.js';
import { env } from '../config/env.config.js';
import { AppError } from '../utils/appError.js';
import { uploadImage } from '../config/cloudinary.config.js';
import { domainEventBus } from '../events/domainEventBus.js';
import { DomainEventType } from '../types/activity.types.js';

export class AuthService {
  constructor(private userRepo: UserRepository = userRepository) {}

  public sanitizeUser(user: IUserDocument): SanitizedUser {
    return {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      provider: user.provider,
      isEmailVerified: user.isEmailVerified,
      lastOrganization: user.lastOrganization ? user.lastOrganization.toString() : null,
      lastWorkspace: user.lastWorkspace ? user.lastWorkspace.toString() : null,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public generateTokens(userId: string, email: string, role: any): AuthTokens {
    const accessPayload: JwtAccessPayload = { userId, email, role };
    const refreshPayload: JwtRefreshPayload = { userId };

    const accessToken = jwt.sign(accessPayload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }

  public async register(payload: { name: string; username: string; email: string; password: string }): Promise<{ user: SanitizedUser; tokens: AuthTokens }> {
    const cleanEmail = payload.email.toLowerCase().trim();
    const cleanUsername = payload.username.toLowerCase().trim();

    const existingEmail = await this.userRepo.findByEmail(cleanEmail);
    if (existingEmail) {
      throw AppError.conflict('An account with this email address already exists');
    }

    const existingUsername = await this.userRepo.findByUsername(cleanUsername);
    if (existingUsername) {
      throw AppError.conflict('This username is already taken');
    }

    const user = await this.userRepo.create({
      ...payload,
      name: payload.name.trim(),
      email: cleanEmail,
      username: cleanUsername,
    });
    const tokens = this.generateTokens(user._id.toString(), user.email, user.role);

    const hashedRefreshToken = this.hashToken(tokens.refreshToken);
    await this.userRepo.updateRefreshToken(user._id.toString(), hashedRefreshToken);

    // Publish Domain Event
    domainEventBus.publish(DomainEventType.USER_REGISTERED, {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    });

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  public async login(payload: { emailOrUsername: string; password: string }): Promise<{ user: SanitizedUser; tokens: AuthTokens }> {
    const user = await this.userRepo.findByEmailOrUsername(payload.emailOrUsername, true);
    if (!user) {
      throw AppError.unauthorized('Invalid email address or password');
    }

    const isMatch = await user.comparePassword(payload.password);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email address or password');
    }

    const tokens = this.generateTokens(user._id.toString(), user.email, user.role);
    const hashedRefreshToken = this.hashToken(tokens.refreshToken);
    await this.userRepo.updateRefreshToken(user._id.toString(), hashedRefreshToken);
    await this.userRepo.updateLastLogin(user._id.toString());

    // Publish Domain Event
    domainEventBus.publish(DomainEventType.USER_LOGGED_IN, {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    });

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  public async refreshTokens(rawRefreshToken: string): Promise<{ user: SanitizedUser; tokens: AuthTokens }> {
    try {
      const decoded = jwt.verify(rawRefreshToken, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
      const user = await this.userRepo.findById(decoded.userId, true);

      if (!user || !user.refreshToken) {
        throw AppError.unauthorized('Invalid refresh token');
      }

      const hashedIncomingToken = this.hashToken(rawRefreshToken);
      if (hashedIncomingToken !== user.refreshToken) {
        // Reuse detection alert: Clear stored refresh token
        await this.userRepo.updateRefreshToken(decoded.userId, null);
        throw AppError.unauthorized('Security alert: Refresh token reuse detected. Please log in again.');
      }

      const tokens = this.generateTokens(user._id.toString(), user.email, user.role);
      const newHashedToken = this.hashToken(tokens.refreshToken);
      await this.userRepo.updateRefreshToken(user._id.toString(), newHashedToken);

      return {
        user: this.sanitizeUser(user),
        tokens,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.unauthorized('Invalid or expired refresh token');
    }
  }

  public async logout(userId: string): Promise<void> {
    await this.userRepo.updateRefreshToken(userId, null);

    // Publish Domain Event
    domainEventBus.publish(DomainEventType.USER_LOGGED_OUT, { userId });
  }

  public async getCurrentUser(userId: string): Promise<SanitizedUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User profile not found');
    }
    return this.sanitizeUser(user);
  }

  public async updateProfile(
    userId: string,
    updateData: { name?: string; username?: string; avatar?: string },
    imageBuffer?: Buffer
  ): Promise<SanitizedUser> {
    if (updateData.username) {
      const existing = await this.userRepo.findByUsername(updateData.username);
      if (existing && existing._id.toString() !== userId) {
        throw AppError.conflict('Username is already taken');
      }
    }

    let avatarUrl = updateData.avatar;
    if (imageBuffer) {
      avatarUrl = await uploadImage(imageBuffer, 'teamflow-avatars');
    }

    const updated = await this.userRepo.updateUser(userId, {
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.username && { username: updateData.username }),
      ...(avatarUrl && { avatar: avatarUrl }),
    });

    if (!updated) {
      throw AppError.notFound('User profile not found');
    }

    return this.sanitizeUser(updated);
  }

  public async changePassword(userId: string, payload: { currentPassword: string; newPassword: string }): Promise<void> {
    const user = await this.userRepo.findById(userId, true);
    if (!user) {
      throw AppError.notFound('User profile not found');
    }

    const isMatch = await user.comparePassword(payload.currentPassword);
    if (!isMatch) {
      throw AppError.badRequest('Current password is incorrect');
    }

    user.password = payload.newPassword;
    await user.save();
    await this.userRepo.updateRefreshToken(userId, null);
  }
}

export const authService = new AuthService();
