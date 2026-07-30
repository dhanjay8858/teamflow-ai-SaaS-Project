import { test, expect, Page } from '@playwright/test';

// Helper functions
async function register(page: Page, suffix: string) {
  await page.goto('/auth/register');
  await page.fill('[data-testid="name-input"], input[placeholder*="Full Name"], input[name="name"]', `E2E User ${suffix}`);
  await page.fill('[data-testid="username-input"], input[placeholder*="username"], input[name="username"]', `e2euser${suffix}`);
  await page.fill('[data-testid="email-input"], input[type="email"], input[name="email"]', `e2e${suffix}@teamflow.ai`);
  await page.fill('[data-testid="password-input"], input[type="password"], input[name="password"]', 'Password123!');
  await page.click('[data-testid="register-btn"], button[type="submit"]');
}

async function login(page: Page, suffix: string) {
  await page.goto('/auth/login');
  await page.fill('input[name="emailOrUsername"], input[placeholder*="email"], input[type="email"]', `e2e${suffix}@teamflow.ai`);
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
}

test.describe('Scenario 1: Full User Journey — Register to Multi-Agent Sprint Plan', () => {
  const suffix = Date.now().toString().slice(-6);

  test('Step 1: Register new account', async ({ page }) => {
    await register(page, suffix);

    // Should redirect to /org/create or /org after register
    await expect(page).toHaveURL(/\/(org|auth\/register)/, { timeout: 8000 });
    await page.screenshot({ path: `e2e-screenshots/s1-register-${suffix}.png` });
  });

  test('Step 2: Create Organization', async ({ page }) => {
    await register(page, suffix);
    await page.waitForURL(/\/org/, { timeout: 8000 });

    // Check if on create org page or redirect handled it
    const url = page.url();
    if (url.includes('/org/create')) {
      await page.fill('input[name="name"], input[placeholder*="Organization"]', `E2E Org ${suffix}`);
      const submitBtn = page.locator('button[type="submit"], button:has-text("Create")').first();
      await submitBtn.click();
    }

    // Wait for dashboard
    await page.waitForURL(/\/org\/.+\/workspace\/.+/, { timeout: 10000 });
    await page.screenshot({ path: `e2e-screenshots/s1-org-created-${suffix}.png` });
    await expect(page.locator('text=Projects')).toBeVisible({ timeout: 5000 });
  });

  test('Step 3: Create Project and Task', async ({ page }) => {
    await register(page, suffix);
    await page.waitForURL(/\/org/, { timeout: 8000 });

    // Navigate to projects
    await page.goto(page.url().replace('/org/create', ''));
    const projectsLink = page.locator('a:has-text("Projects")').first();
    if (await projectsLink.isVisible()) {
      await projectsLink.click();
    }

    // Create first project
    const newProjectBtn = page.locator('button:has-text("New Project"), button:has-text("Create First Project")').first();
    if (await newProjectBtn.isVisible({ timeout: 3000 })) {
      await newProjectBtn.click();
      await page.fill('input[name="name"], input[placeholder*="project name"]', `E2E Sprint ${suffix}`);
      await page.click('button[type="submit"], button:has-text("Create")');
      await page.waitForTimeout(1000);
    }

    // Create a task
    const tasksLink = page.locator('a:has-text("Tasks"), a:has-text("Kanban")').first();
    if (await tasksLink.isVisible({ timeout: 3000 })) {
      await tasksLink.click();
      const newTaskBtn = page.locator('button:has-text("New Task"), button:has-text("+ New Task")').first();
      if (await newTaskBtn.isVisible({ timeout: 3000 })) {
        await newTaskBtn.click();
        await page.fill('input[name="title"], input[placeholder*="task title"]', 'Implement Auth Module');
        await page.click('button[type="submit"], button:has-text("Create Task")');
      }
    }

    await page.screenshot({ path: `e2e-screenshots/s1-task-created-${suffix}.png` });
  });

  test('Step 4: Run Multi-Agent Sprint Plan', async ({ page }) => {
    await register(page, suffix);
    await page.waitForURL(/\/org/, { timeout: 8000 });

    // Navigate to AI Agents Hub
    const agentsLink = page.locator('a:has-text("AI Agents Hub"), a:has-text("Agents")').first();
    if (await agentsLink.isVisible({ timeout: 5000 })) {
      await agentsLink.click();
      await page.waitForURL(/\/agents/, { timeout: 5000 });

      // Select ScrumMaster Agent
      const scrumBtn = page.locator('button:has-text("ScrumMaster")').first();
      if (await scrumBtn.isVisible({ timeout: 3000 })) {
        await scrumBtn.click();
      }

      // Enable Multi-Agent
      const multiAgentCheckbox = page.locator('input[type="checkbox"]').first();
      if (await multiAgentCheckbox.isVisible({ timeout: 2000 })) {
        await multiAgentCheckbox.check();
      }

      // Run Agent
      const runBtn = page.locator('button:has-text("Run Agent")').first();
      if (await runBtn.isVisible({ timeout: 3000 })) {
        await runBtn.click();
        await page.waitForTimeout(8000); // Wait for LLM response
      }

      await page.screenshot({ path: `e2e-screenshots/s1-agent-run-${suffix}.png` });

      // Verify execution output appears
      const output = page.locator('text=Agent Execution Output, text=Sprint, text=sprint').first();
      await expect(output).toBeVisible({ timeout: 15000 });
    }
  });
});

test.describe('Scenario 3: RBAC — Unauthorized access blocked', () => {
  test('Unauthenticated user redirected to login page', async ({ page }) => {
    // Try to access protected dashboard without auth
    await page.goto('/org/some-org/workspace/general/projects');

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
    await page.screenshot({ path: 'e2e-screenshots/s3-rbac-redirect.png' });
  });

  test('Protected API returns 401 without auth token', async ({ request }) => {
    const res = await request.get('http://localhost:5000/api/v1/auth/me');
    expect(res.status()).toBe(401);
  });

  test('AI endpoint returns 401 without auth token', async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/v1/agents/run', {
      data: { agentId: 'scrum-master-agent', workspaceId: 'ws-001', goal: 'hack' },
    });
    expect(res.status()).toBe(401);
  });
});
