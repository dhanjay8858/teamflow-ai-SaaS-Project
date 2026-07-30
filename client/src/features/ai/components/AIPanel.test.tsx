import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AIPanel } from './AIPanel';

// Mock workspace store
vi.mock('../../../stores/workspace.store', () => ({
  useWorkspaceStore: () => ({
    currentWorkspace: { _id: 'ws-001', name: 'Engineering Workspace' },
  }),
}));

// Mock useWorkspaceAi hook
vi.mock('../hooks/useWorkspaceAi', () => ({
  useWorkspaceAi: () => ({
    messages: [],
    isLoading: false,
    askQuestion: vi.fn(),
    clearConversation: vi.fn(),
  }),
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe('AIPanel Component', () => {
  const user = userEvent.setup();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AIPanel isOpen={false} onClose={mockOnClose} />,
      { wrapper: createWrapper() }
    );
    // Panel renders null when closed
    expect(container.firstChild).toBeNull();
  });

  it('renders AI panel when isOpen is true', () => {
    render(<AIPanel isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });
    // The text 'Workspace AI Assistant' appears in both the panel header (h2)
    // and the ChatWindow empty state (h3) — use getAllByText
    const elements = screen.getAllByText(/Workspace AI Assistant/i);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it('displays the current workspace name', () => {
    render(<AIPanel isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });
    expect(screen.getByText('Engineering Workspace')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(<AIPanel isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });
    const closeButton = screen.getByTitle('Close Panel');
    await user.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('has a clear chat button', () => {
    render(<AIPanel isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });
    const clearBtn = screen.getByTitle('Clear Chat');
    expect(clearBtn).toBeInTheDocument();
  });

  it('has a toggle sidebar button', () => {
    render(<AIPanel isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });
    const toggleBtn = screen.getByTitle('Toggle Sidebar');
    expect(toggleBtn).toBeInTheDocument();
  });
});
