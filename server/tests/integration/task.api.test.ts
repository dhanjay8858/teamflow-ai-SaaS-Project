import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

vi.mock('../../src/config/env.config.js', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test-secret', JWT_REFRESH_SECRET: 'test-refresh',
    JWT_ACCESS_EXPIRES_IN: '15m', JWT_REFRESH_EXPIRES_IN: '7d',
    CLIENT_URL: 'http://localhost:3000', NODE_ENV: 'test', PORT: 5001,
  },
}));
vi.mock('../../src/config/cloudinary.config.js', () => ({ uploadImage: vi.fn() }));
vi.mock('../../src/events/domainEventBus.js', () => ({
  domainEventBus: { publish: vi.fn(), subscribe: vi.fn() },
}));
vi.mock('../../src/middleware/auth.middleware.js', () => ({
  authenticate: vi.fn((_req: any, _res: any, next: any) => {
    _req.user = { userId: 'user-001', email: 'test@teamflow.ai', role: 'USER' };
    next();
  }),
}));
vi.mock('../../src/middleware/rbac.middleware.js', () => ({
  requireOrgRole: () => (_req: any, _res: any, next: any) => next(),
  requireWorkspaceRole: () => (_req: any, _res: any, next: any) => next(),
}));

vi.mock('../../src/services/task.service.js', () => {
  const dummyTask = {
    _id: 'task-001', taskKey: 'ALPHA-1', title: 'Build Auth API',
    status: 'TODO', priority: 'HIGH', project: 'proj-001', workspace: 'ws-001',
  };
  return {
    taskService: {
      createTask: vi.fn().mockResolvedValue(dummyTask),
      getBoardTasks: vi.fn().mockResolvedValue([dummyTask]),
      getTaskById: vi.fn().mockResolvedValue(dummyTask),
      changeStatus: vi.fn().mockResolvedValue({ ...dummyTask, status: 'IN_PROGRESS' }),
      assignTask: vi.fn().mockResolvedValue({ ...dummyTask, assignee: 'user-001' }),
      archiveTask: vi.fn().mockResolvedValue({ ...dummyTask, archivedAt: new Date() }),
    },
  };
});

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

describe('Task API Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a task and return 201', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', 'Bearer fake.access.token')
        .send({ title: 'Build Auth API', boardId: '65c1234567890abcdef12345' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.task.taskKey).toBe('ALPHA-1');
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', 'Bearer fake.access.token')
        .send({ boardId: '65c1234567890abcdef12345' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should list tasks for a board query', async () => {
      const res = await request(app)
        .get('/api/v1/tasks?boardId=65c1234567890abcdef12345')
        .set('Authorization', 'Bearer fake.access.token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.tasks).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/v1/tasks/status', () => {
    it('should update task status', async () => {
      const res = await request(app)
        .post('/api/v1/tasks/status')
        .set('Authorization', 'Bearer fake.access.token')
        .send({ taskId: '65c1234567890abcdef12345', status: 'IN_PROGRESS' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.task.status).toBe('IN_PROGRESS');
    });

    it('should return 400 for invalid status value', async () => {
      const res = await request(app)
        .post('/api/v1/tasks/status')
        .set('Authorization', 'Bearer fake.access.token')
        .send({ taskId: '65c1234567890abcdef12345', status: 'INVALID_STATUS' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('RBAC — Permission Failures', () => {
    it('should return 401 for unauthenticated task creation', async () => {
      const { authenticate } = await import('../../src/middleware/auth.middleware.js');
      (authenticate as any).mockImplementationOnce((_req: any, res: any) => {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      });

      const res = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Secret Task', boardId: '65c1234567890abcdef12345' });

      expect(res.statusCode).toBe(401);
    });
  });
});
