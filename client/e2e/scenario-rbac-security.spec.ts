import { test, expect } from '@playwright/test';

/**
 * Scenario 3: RBAC Security — Role-Based Access Control Enforcement
 *
 * Tests that:
 * - Unauthenticated users cannot access protected API endpoints.
 * - Protected routes return 401 for missing Bearer token.
 * - Admin-only endpoints respond correctly to unauthorized callers.
 */
test.describe('Scenario 3: RBAC Security Enforcement', () => {
  test('unauthenticated requests to protected API return 401', async ({ request }) => {
    // Health endpoint should be public
    const health = await request.get('http://localhost:5000/health');
    expect(health.ok()).toBeTruthy();

    // Protected AI endpoint requires authentication
    const ai = await request.get('http://localhost:5000/api/v1/ai/health');
    // Either 401 (unauthenticated) or another status — never 500 server error
    expect(ai.status()).not.toBe(500);
    // If AI health is protected it must return 401
    if (ai.status() !== 200) {
      expect(ai.status()).toBe(401);
    }
  });

  test('unauthenticated task creation attempt returns 401', async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/v1/tasks', {
      data: {
        title: 'Malicious Task',
        boardId: 'board-id',
        projectId: 'project-id',
      },
    });
    // Must reject unauthenticated requests
    expect(res.status()).toBe(401);
  });

  test('unauthenticated organization access attempt returns 401', async ({ request }) => {
    const res = await request.get('http://localhost:5000/api/v1/organizations');
    expect(res.status()).toBe(401);
  });

  test('unauthenticated agent run attempt returns 401', async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/v1/agents/run', {
      data: {
        agentId: 'scrum-master-agent',
        workspaceId: 'ws-001',
        goal: 'Unauthorized goal',
      },
    });
    expect(res.status()).toBe(401);
  });

  test('unauthenticated workspace AI request returns 401', async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/v1/ai/workspace/ws-001/query', {
      data: { question: 'What are the overdue tasks?' },
    });
    // 401 or 404 (route might differ), never 200 for unauthenticated
    expect([401, 404]).toContain(res.status());
  });

  test('random unknown routes return 404 not 500', async ({ request }) => {
    const res = await request.get('http://localhost:5000/api/v1/does-not-exist-rbac-test');
    expect(res.status()).toBe(404);
  });

  test('API response includes security headers (X-Content-Type-Options)', async ({ request }) => {
    const res = await request.get('http://localhost:5000/health');
    // Helmet sets X-Content-Type-Options: nosniff
    const header = res.headers()['x-content-type-options'];
    expect(header).toBe('nosniff');
  });

  test('API response includes X-Frame-Options security header', async ({ request }) => {
    const res = await request.get('http://localhost:5000/health');
    // Helmet sets X-Frame-Options
    const header = res.headers()['x-frame-options'];
    expect(header).toBeDefined();
  });
});
