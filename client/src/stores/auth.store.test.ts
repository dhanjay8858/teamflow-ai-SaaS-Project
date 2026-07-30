import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './auth.store';

describe('Auth Store (Zustand)', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: true,
    });
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isInitializing).toBe(true);
  });

  it('should set user and mark as authenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = {
      id: 'user-001',
      name: 'Test User',
      username: 'testuser',
      email: 'test@teamflow.ai',
      role: 'USER' as const,
      avatar: null,
      provider: 'local' as const,
      isEmailVerified: false,
      lastOrganization: null,
      lastWorkspace: null,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.setUser(mockUser as any);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isInitializing).toBe(false);
  });

  it('should clear user on logout', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser({ id: 'user-001', name: 'Test' } as any);
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isInitializing).toBe(false);
  });

  it('should update loading state', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should update initializing state', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setInitializing(false);
    });

    expect(result.current.isInitializing).toBe(false);
  });
});
