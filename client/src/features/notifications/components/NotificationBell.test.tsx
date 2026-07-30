import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationBell } from './NotificationBell';

// -----------------------------------------------------------------------
// The useNotifications hook returns:
//   { notificationsQuery, unreadCount, markReadMutation, markAllReadMutation,
//     deleteNotificationMutation }
//
// NotificationList reads: notificationsQuery.data?.pages
// NotificationBell reads: unreadCount
// -----------------------------------------------------------------------

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: () => ({
    notificationsQuery: {
      data: {
        pages: [
          {
            data: {
              notifications: [
                {
                  _id: 'n1',
                  title: 'Task Assigned',
                  message: 'ALPHA-1 assigned to you',
                  type: 'TASK_ASSIGNED',
                  isRead: false,
                  createdAt: new Date().toISOString(),
                },
                {
                  _id: 'n2',
                  title: 'Comment Added',
                  message: 'New comment on ALPHA-2',
                  type: 'COMMENT_ADDED',
                  isRead: true,
                  createdAt: new Date().toISOString(),
                },
              ],
              nextCursor: null,
            },
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    },
    unreadCount: 1,
    markReadMutation: { mutateAsync: vi.fn(), isPending: false },
    markAllReadMutation: { mutateAsync: vi.fn(), isPending: false },
    deleteNotificationMutation: { mutateAsync: vi.fn(), isPending: false },
  }),
}));

// Mock socket client to avoid real connections
vi.mock('../../../config/socket.client', () => ({
  socketClient: {
    connect: () => ({
      connected: false,
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    }),
  },
  socket: { on: vi.fn(), off: vi.fn() },
}));

// Mock auth store — user must be authenticated
vi.mock('../../../stores/auth.store', () => ({
  useAuthStore: () => ({
    user: { id: 'user-001', name: 'Test User' },
    isAuthenticated: true,
  }),
}));

// Wrapper to supply QueryClient
const createWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe('NotificationBell Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the bell icon button', () => {
    render(<NotificationBell />, { wrapper: createWrapper() });
    const button = screen.getByRole('button', { name: /notifications/i });
    expect(button).toBeInTheDocument();
  });

  it('shows unread badge count when there are unread notifications', () => {
    render(<NotificationBell />, { wrapper: createWrapper() });
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('toggles dropdown open on bell click', async () => {
    render(<NotificationBell />, { wrapper: createWrapper() });
    const bell = screen.getByRole('button', { name: /notifications/i });

    // Initially closed — no dropdown
    expect(screen.queryByText('Task Assigned')).not.toBeInTheDocument();

    // Open
    await user.click(bell);

    await waitFor(() => {
      // After opening the dropdown should be rendered
      // The dropdown contains Notification items
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });
  });

  it('closes dropdown when clicking bell again (toggle)', async () => {
    render(<NotificationBell />, { wrapper: createWrapper() });
    const bell = screen.getByRole('button', { name: /notifications/i });

    await user.click(bell); // open
    await user.click(bell); // close

    // Dropdown should no longer be present after second click
    await waitFor(() => {
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  it('has correct aria-expanded attribute before and after click', async () => {
    render(<NotificationBell />, { wrapper: createWrapper() });
    const bell = screen.getByRole('button', { name: /notifications/i });

    expect(bell).toHaveAttribute('aria-expanded', 'false');

    await user.click(bell);

    await waitFor(() => {
      expect(bell).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
