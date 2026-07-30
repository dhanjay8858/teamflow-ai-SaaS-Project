import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkspaceStore } from './workspace.store';
import { act } from '@testing-library/react';

describe('Workspace Store (Zustand)', () => {
  beforeEach(() => {
    act(() => {
      useWorkspaceStore.setState({
        currentWorkspace: null,
        workspaces: [],
      });
    });
  });

  it('should have correct initial state', () => {
    const state = useWorkspaceStore.getState();
    expect(state.currentWorkspace).toBeNull();
    expect(state.workspaces).toEqual([]);
  });

  it('should set current workspace', () => {
    const mockWorkspace = {
      _id: 'ws-001',
      name: 'Engineering',
      organizationId: 'org-001',
      createdAt: new Date().toISOString(),
    } as any;

    act(() => {
      useWorkspaceStore.getState().setCurrentWorkspace(mockWorkspace);
    });

    expect(useWorkspaceStore.getState().currentWorkspace).toEqual(mockWorkspace);
    expect(useWorkspaceStore.getState().currentWorkspace?._id).toBe('ws-001');
  });

  it('should clear current workspace by setting null', () => {
    const mockWorkspace = { _id: 'ws-001', name: 'Engineering' } as any;

    act(() => {
      useWorkspaceStore.getState().setCurrentWorkspace(mockWorkspace);
    });
    expect(useWorkspaceStore.getState().currentWorkspace).not.toBeNull();

    act(() => {
      useWorkspaceStore.getState().setCurrentWorkspace(null);
    });
    expect(useWorkspaceStore.getState().currentWorkspace).toBeNull();
  });

  it('should set workspaces list', () => {
    const mockWorkspaces = [
      { _id: 'ws-001', name: 'Engineering' },
      { _id: 'ws-002', name: 'Marketing' },
      { _id: 'ws-003', name: 'Design' },
    ] as any[];

    act(() => {
      useWorkspaceStore.getState().setWorkspaces(mockWorkspaces);
    });

    expect(useWorkspaceStore.getState().workspaces).toHaveLength(3);
    expect(useWorkspaceStore.getState().workspaces[1].name).toBe('Marketing');
  });

  it('should replace workspaces list when called again', () => {
    act(() => {
      useWorkspaceStore.getState().setWorkspaces([{ _id: 'ws-001' } as any]);
    });
    expect(useWorkspaceStore.getState().workspaces).toHaveLength(1);

    act(() => {
      useWorkspaceStore.getState().setWorkspaces([]);
    });
    expect(useWorkspaceStore.getState().workspaces).toHaveLength(0);
  });
});
