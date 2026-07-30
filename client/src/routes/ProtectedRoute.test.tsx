import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../stores/auth.store';

vi.mock('../stores/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner while initializing', () => {
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: false,
      isInitializing: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );

    expect(screen.getByText(/Verifying security session/i)).toBeInTheDocument();
  });

  it('should redirect to login if not authenticated', () => {
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: false,
      isInitializing: false,
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/org']}>
        <ProtectedRoute />
      </MemoryRouter>
    );

    expect(container.textContent).toBe('');
  });

  it('should render children if authenticated', () => {
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      isInitializing: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Verifying security session/i)).not.toBeInTheDocument();
  });
});
