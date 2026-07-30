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
    NODE_ENV: 'test',
    PORT: 5001,
  },
}));
vi.mock('../../src/config/cloudinary.config.js', () => ({ uploadImage: vi.fn() }));
vi.mock('../../src/events/domainEventBus.js', () => ({
  domainEventBus: { publish: vi.fn(), subscribe: vi.fn() },
}));

vi.mock('../../src/middleware/auth.middleware.js', () => ({
  authenticate: vi.fn((_req: any, _res: any, next: any) => {
    _req.user = { userId: 'user-001', email: 'owner@teamflow.ai', role: 'USER' };
    next();
  }),
}));

vi.mock('../../src/middleware/rbac.middleware.js', () => ({
  requireOrgRole: () => (_req: any, _res: any, next: any) => next(),
  requireWorkspaceRole: () => (_req: any, _res: any, next: any) => next(),
}));

vi.mock('../../src/services/organization.service.js', () => {
  const dummyOrg = {
    _id: 'org-001',
    name: 'Test Org',
    slug: 'test-org',
    owner: 'user-001',
  };
  return {
    organizationService: {
      createOrganization: vi.fn().mockResolvedValue({ organization: dummyOrg, workspace: {} }),
      getOrganizationById: vi.fn().mockResolvedValue(dummyOrg),
      getOrganizationBySlug: vi.fn().mockResolvedValue(dummyOrg),
      getUserOrganizations: vi.fn().mockResolvedValue([dummyOrg]),
      updateOrganization: vi.fn().mockResolvedValue(dummyOrg),
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

describe('Organization API Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  describe('POST /api/v1/organizations', () => {
    it('should return 201 when creating an organization', async () => {
      const res = await request(app)
        .post('/api/v1/organizations')
        .set('Authorization', 'Bearer fake.access.token')
        .send({ name: 'Test Org', slug: 'test-org' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.organization).toBeDefined();
    });

    it('should return 400 if organization name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/organizations')
        .set('Authorization', 'Bearer fake.access.token')
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/organizations/:id', () => {
    it('should return 200 with organization details for valid ID', async () => {
      const res = await request(app)
        .get('/api/v1/organizations/org-001')
        .set('Authorization', 'Bearer fake.access.token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.organization.slug).toBe('test-org');
    });
  });
});
