import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

vi.mock('../../src/config/env.config.js', () => ({
  env: {
    JWT_ACCESS_SECRET: 'integration-access-secret',
    JWT_REFRESH_SECRET: 'integration-refresh-secret',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    CLIENT_URL: 'http://localhost:3000',
    MONGODB_URI: 'mongodb://localhost:27017/teamflow-test',
    PORT: 5001,
    NODE_ENV: 'test',
  },
}));

vi.mock('../../src/config/cloudinary.config.js', () => ({
  uploadImage: vi.fn(),
}));

vi.mock('../../src/events/domainEventBus.js', () => ({
  domainEventBus: { publish: vi.fn(), subscribe: vi.fn() },
}));

// Mock the entire auth service so integration tests don't require real MongoDB
vi.mock('../../src/services/auth.service.js', () => {
  const generateFakeTokens = () => ({
    accessToken: 'fake.access.token',
    refreshToken: 'fake.refresh.token',
  });

  return {
    authService: {
      register: vi.fn().mockResolvedValue({
        user: {
          id: 'user-001',
          name: 'Test User',
          username: 'testuser',
          email: 'test@teamflow.ai',
          role: 'USER',
          avatar: null,
        },
        tokens: generateFakeTokens(),
      }),
      login: vi.fn().mockResolvedValue({
        user: {
          id: 'user-001',
          name: 'Test User',
          username: 'testuser',
          email: 'test@teamflow.ai',
          role: 'USER',
        },
        tokens: generateFakeTokens(),
      }),
      getCurrentUser: vi.fn().mockResolvedValue({
        id: 'user-001',
        name: 'Test User',
        email: 'test@teamflow.ai',
      }),
      logout: vi.fn().mockResolvedValue(undefined),
    },
    AuthService: vi.fn(),
  };
});

vi.mock('../../src/middleware/auth.middleware.js', () => ({
  authenticate: vi.fn((_req: any, _res: any, next: any) => {
    _req.user = { userId: 'user-001', email: 'test@teamflow.ai', role: 'USER' };
    next();
  }),
}));

// Mock Mongoose properly so Schema.Types.ObjectId works
vi.mock('mongoose', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      connect: vi.fn().mockResolvedValue({}),
      connection: { readyState: 1 },
    },
  };
});

describe('Auth API Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 201 with user and tokens on successful registration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          username: 'testuser',
          email: 'test@teamflow.ai',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('test@teamflow.ai');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'nope@test.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test',
          username: 'test',
          email: 'not-an-email',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for weak password (no uppercase)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test',
          username: 'testuser',
          email: 'test@teamflow.ai',
          password: 'weakpassword1',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 200 with user on valid login', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          emailOrUsername: 'test@teamflow.ai',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
    });

    it('should return 400 for missing credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 200 with current user for authenticated request', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer fake.access.token');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should return 200 and clear cookies on logout', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer fake.access.token');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /health', () => {
    it('should return 200 with health status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers from helmet', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/v1/does-not-exist');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
