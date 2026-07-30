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

vi.mock('../../src/ai/services/ai.service.js', () => ({
  aiService: {
    getHealth: vi.fn().mockResolvedValue({
      status: 'healthy',
      activeProvider: 'groq',
      providers: { groq: 'healthy', gemini: 'healthy', ollama: 'degraded' },
    }),
  },
}));

vi.mock('../../src/ai/agents/runtime/agent.runtime.js', () => ({
  agentRuntime: {
    run: vi.fn().mockResolvedValue({
      agentId: 'scrum-master-agent',
      output: '## Sprint Plan\n\n**Sprint velocity**: 34 story points',
      reflection: { confidenceScore: 0.95, reflectionSummary: 'High confidence on sprint plan' },
      executionId: 'exec-001',
    }),
  },
}));

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

describe('AI & Agent API Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  describe('GET /api/v1/ai/health', () => {
    it('should return AI provider health status', async () => {
      const res = await request(app)
        .get('/api/v1/ai/health')
        .set('Authorization', 'Bearer fake.access.token');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
    });
  });

  describe('POST /api/v1/agents/run', () => {
    it('should execute a single agent and return structured output', async () => {
      const res = await request(app)
        .post('/api/v1/agents/run')
        .set('Authorization', 'Bearer fake.access.token')
        .send({
          agentId: 'scrum-master-agent',
          workspaceId: '65c1234567890abcdef12345',
          goal: 'Generate 2-week sprint plan',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.agentId).toBe('scrum-master-agent');
      expect(res.body.data.output).toContain('Sprint Plan');
      expect(res.body.data.reflection).toBeDefined();
    });

    it('should return 400 when agentId or workspaceId is missing', async () => {
      const res = await request(app)
        .post('/api/v1/agents/run')
        .set('Authorization', 'Bearer fake.access.token')
        .send({ goal: 'Missing required fields' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/agents', () => {
    it('should return the list of registered agents', async () => {
      const res = await request(app)
        .get('/api/v1/agents')
        .set('Authorization', 'Bearer fake.access.token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});
