import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../../src/services/auth.service.js';
import { AppError } from '../../src/utils/appError.js';

// Mock dependencies
vi.mock('../../src/config/env.config.js', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test-access-secret-for-vitest',
    JWT_REFRESH_SECRET: 'test-refresh-secret-for-vitest',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}));

vi.mock('../../src/config/cloudinary.config.js', () => ({
  uploadImage: vi.fn().mockResolvedValue('https://cdn.cloudinary.com/test-avatar.jpg'),
}));

vi.mock('../../src/events/domainEventBus.js', () => ({
  domainEventBus: {
    publish: vi.fn(),
  },
}));

const mockUserRecord = {
  _id: { toString: () => '65c1234567890abcdef12345' },
  name: 'Test User',
  username: 'testuser',
  email: 'test@teamflow.ai',
  password: 'hashed_password',
  role: 'USER',
  avatar: null,
  provider: 'local',
  isEmailVerified: false,
  lastOrganization: null,
  lastWorkspace: null,
  lastLoginAt: new Date(),
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  comparePassword: vi.fn(),
  save: vi.fn(),
};

describe('AuthService — Unit Tests', () => {
  let mockUserRepo: any;
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepo = {
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      findByEmailOrUsername: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      updateRefreshToken: vi.fn(),
      updateLastLogin: vi.fn(),
      updateUser: vi.fn(),
    };
    authService = new AuthService(mockUserRepo as any);
  });

  // ──────── generateTokens ────────
  describe('generateTokens', () => {
    it('should return both accessToken and refreshToken as strings', () => {
      const tokens = authService.generateTokens('user123', 'user@test.com', 'USER');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(tokens.accessToken.split('.').length).toBe(3); // JWT has 3 parts
      expect(tokens.refreshToken.split('.').length).toBe(3);
    });
  });

  // ──────── sanitizeUser ────────
  describe('sanitizeUser', () => {
    it('should return sanitized user without password or refreshToken', () => {
      const sanitized = authService.sanitizeUser(mockUserRecord as any);
      expect(sanitized.id).toBe('65c1234567890abcdef12345');
      expect(sanitized.email).toBe('test@teamflow.ai');
      expect((sanitized as any).password).toBeUndefined();
      expect((sanitized as any).refreshToken).toBeUndefined();
    });
  });

  // ──────── register ────────
  describe('register', () => {
    it('should register a new user and return user + tokens', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.findByUsername.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(mockUserRecord);
      mockUserRepo.updateRefreshToken.mockResolvedValue(undefined);

      const result = await authService.register({
        name: 'Test User',
        username: 'testuser',
        email: 'test@teamflow.ai',
        password: 'Password123!',
      });

      expect(result.user.email).toBe('test@teamflow.ai');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(mockUserRepo.create).toHaveBeenCalledOnce();
      expect(mockUserRepo.updateRefreshToken).toHaveBeenCalledOnce();
    });

    it('should throw 409 if email is already registered', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUserRecord);

      await expect(
        authService.register({
          name: 'Test',
          username: 'unique_user',
          email: 'test@teamflow.ai',
          password: 'Password123!',
        })
      ).rejects.toThrow(AppError);

      await expect(
        authService.register({
          name: 'Test',
          username: 'unique_user',
          email: 'test@teamflow.ai',
          password: 'Password123!',
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('should throw 409 if username is already taken', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.findByUsername.mockResolvedValue(mockUserRecord);

      await expect(
        authService.register({
          name: 'Test',
          username: 'testuser',
          email: 'unique@teamflow.ai',
          password: 'Password123!',
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  // ──────── login ────────
  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      mockUserRecord.comparePassword = vi.fn().mockResolvedValue(true);
      mockUserRepo.findByEmailOrUsername.mockResolvedValue(mockUserRecord);
      mockUserRepo.updateRefreshToken.mockResolvedValue(undefined);
      mockUserRepo.updateLastLogin.mockResolvedValue(undefined);

      const result = await authService.login({
        emailOrUsername: 'test@teamflow.ai',
        password: 'Password123!',
      });

      expect(result.user.email).toBe('test@teamflow.ai');
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('should throw 401 if user not found', async () => {
      mockUserRepo.findByEmailOrUsername.mockResolvedValue(null);

      await expect(
        authService.login({ emailOrUsername: 'notfound@test.com', password: 'wrong' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 401 if password is incorrect', async () => {
      mockUserRecord.comparePassword = vi.fn().mockResolvedValue(false);
      mockUserRepo.findByEmailOrUsername.mockResolvedValue(mockUserRecord);

      await expect(
        authService.login({ emailOrUsername: 'test@teamflow.ai', password: 'wrongpass' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  // ──────── logout ────────
  describe('logout', () => {
    it('should clear the refresh token on logout', async () => {
      mockUserRepo.updateRefreshToken.mockResolvedValue(undefined);
      await authService.logout('65c1234567890abcdef12345');
      expect(mockUserRepo.updateRefreshToken).toHaveBeenCalledWith(
        '65c1234567890abcdef12345',
        null
      );
    });
  });

  // ──────── getCurrentUser ────────
  describe('getCurrentUser', () => {
    it('should return sanitized user profile by ID', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUserRecord);
      const result = await authService.getCurrentUser('65c1234567890abcdef12345');
      expect(result.email).toBe('test@teamflow.ai');
    });

    it('should throw 404 if user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);
      await expect(
        authService.getCurrentUser('nonexistent-id')
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ──────── updateProfile ────────
  describe('updateProfile', () => {
    it('should update user profile name', async () => {
      mockUserRepo.findByUsername.mockResolvedValue(null);
      mockUserRepo.updateUser.mockResolvedValue({ ...mockUserRecord, name: 'Updated Name' });

      const result = await authService.updateProfile('65c1234567890abcdef12345', {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw 409 if new username is already taken by another user', async () => {
      const anotherUser = { ...mockUserRecord, _id: { toString: () => 'different-id' } };
      mockUserRepo.findByUsername.mockResolvedValue(anotherUser);

      await expect(
        authService.updateProfile('65c1234567890abcdef12345', { username: 'taken_username' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });
});
