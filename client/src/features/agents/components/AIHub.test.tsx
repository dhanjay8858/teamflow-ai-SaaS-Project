import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIHub } from './AIHub';

// -----------------------------------------------------------------------
// Mock the API client used by AIHub
// -----------------------------------------------------------------------
vi.mock('../../../config/api.client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      success: true,
      data: [
        { id: 'scrum-master-agent', name: 'ScrumMaster Agent', description: 'Sprint planning & retrospectives', category: 'SCRUM_MASTER', version: '1.0.0', supportedGoals: [] },
        { id: 'project-manager-agent', name: 'ProjectManager Agent', description: 'Milestones & roadmap risk', category: 'PROJECT_MANAGER', version: '1.0.0', supportedGoals: [] },
        { id: 'qa-agent', name: 'QA Engineer Agent', description: 'Test cases & acceptance criteria', category: 'QA_ENGINEER', version: '1.0.0', supportedGoals: [] },
        { id: 'technical-writer-agent', name: 'TechnicalWriter Agent', description: 'Release notes & docs', category: 'TECHNICAL_WRITER', version: '1.0.0', supportedGoals: [] },
        { id: 'release-manager-agent', name: 'ReleaseManager Agent', description: 'Deployment readiness checklist', category: 'RELEASE_MANAGER', version: '1.0.0', supportedGoals: [] },
        { id: 'knowledge-agent', name: 'Knowledge Agent', description: 'Workspace architecture search', category: 'KNOWLEDGE_ENGINEER', version: '1.0.0', supportedGoals: [] },
      ],
    }),
    post: vi.fn(),
  },
}));

// Mock workspace store — provide a current workspace
vi.mock('../../../stores/workspace.store', () => ({
  useWorkspaceStore: () => ({
    currentWorkspace: { _id: 'ws-001', name: 'Engineering Workspace' },
  }),
}));

describe('AIHub Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Multi-Agent Orchestration Hub title', async () => {
    render(<AIHub />);
    await waitFor(() => {
      expect(screen.getByText(/Multi-Agent Orchestration Hub/i)).toBeInTheDocument();
    });
  });

  it('renders version badge v12.0', async () => {
    render(<AIHub />);
    await waitFor(() => {
      expect(screen.getByText('v12.0')).toBeInTheDocument();
    });
  });

  it('fetches and displays agent list on mount', async () => {
    render(<AIHub />);
    await waitFor(() => {
      expect(screen.getByText('ScrumMaster Agent')).toBeInTheDocument();
      expect(screen.getByText('QA Engineer Agent')).toBeInTheDocument();
      expect(screen.getByText('Knowledge Agent')).toBeInTheDocument();
    });
  });

  it('shows all 6 agents from the API response', async () => {
    render(<AIHub />);
    await waitFor(() => {
      expect(screen.getByText('ScrumMaster Agent')).toBeInTheDocument();
      expect(screen.getByText('ProjectManager Agent')).toBeInTheDocument();
      expect(screen.getByText('QA Engineer Agent')).toBeInTheDocument();
      expect(screen.getByText('TechnicalWriter Agent')).toBeInTheDocument();
      expect(screen.getByText('ReleaseManager Agent')).toBeInTheDocument();
      expect(screen.getByText('Knowledge Agent')).toBeInTheDocument();
    });
  });

  it('renders a goal/objective input field', async () => {
    render(<AIHub />);
    await waitFor(() => {
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });
  });

  it('updates goal input when user types', async () => {
    render(<AIHub />);
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Generate release notes for v2.0');

    expect((input as HTMLTextAreaElement).value).toContain('Generate release notes');
  });

  it('renders multi-agent toggle checkbox', async () => {
    render(<AIHub />);
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders the Run Agent button', async () => {
    render(<AIHub />);
    await waitFor(() => {
      const runButton = screen.getByRole('button', { name: /run/i });
      expect(runButton).toBeInTheDocument();
    });
  });

  it('shows subtitle describing agent capabilities', async () => {
    render(<AIHub />);
    await waitFor(() => {
      expect(screen.getByText(/Autonomous specialized agents for TeamFlow AI/i)).toBeInTheDocument();
    });
  });
});
