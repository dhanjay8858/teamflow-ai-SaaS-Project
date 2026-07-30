import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskUiStore } from './taskUi.store';
import { act } from '@testing-library/react';
import { Task } from '../types/task';

const mockTask: Task = {
  _id: 'task-001',
  title: 'Fix login bug',
  description: 'Authentication flow broken',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  taskNumber: 1,
  projectId: 'proj-001',
  boardId: 'board-001',
  workspaceId: 'ws-001',
  position: 0,
  subtasks: [],
  checklists: [],
  watchers: [],
  tags: [],
  dependencies: [],
  attachments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} as unknown as Task;

describe('TaskUI Store (Zustand)', () => {
  beforeEach(() => {
    act(() => {
      useTaskUiStore.setState({
        selectedTask: null,
        isDrawerOpen: false,
        isCreateModalOpen: false,
        createModalDefaultBoardId: null,
      });
    });
  });

  it('should have correct initial state', () => {
    const state = useTaskUiStore.getState();
    expect(state.selectedTask).toBeNull();
    expect(state.isDrawerOpen).toBe(false);
    expect(state.isCreateModalOpen).toBe(false);
    expect(state.createModalDefaultBoardId).toBeNull();
  });

  it('should set selected task', () => {
    act(() => {
      useTaskUiStore.getState().setSelectedTask(mockTask);
    });

    const state = useTaskUiStore.getState();
    expect(state.selectedTask).toEqual(mockTask);
    expect(state.selectedTask?._id).toBe('task-001');
  });

  it('should open drawer with task', () => {
    act(() => {
      useTaskUiStore.getState().openDrawer(mockTask);
    });

    const state = useTaskUiStore.getState();
    expect(state.isDrawerOpen).toBe(true);
    expect(state.selectedTask).toEqual(mockTask);
  });

  it('should close drawer and clear selected task', () => {
    act(() => {
      useTaskUiStore.getState().openDrawer(mockTask);
    });
    expect(useTaskUiStore.getState().isDrawerOpen).toBe(true);

    act(() => {
      useTaskUiStore.getState().closeDrawer();
    });

    const state = useTaskUiStore.getState();
    expect(state.isDrawerOpen).toBe(false);
    expect(state.selectedTask).toBeNull();
  });

  it('should open create modal without a default boardId', () => {
    act(() => {
      useTaskUiStore.getState().openCreateModal();
    });

    const state = useTaskUiStore.getState();
    expect(state.isCreateModalOpen).toBe(true);
    expect(state.createModalDefaultBoardId).toBeNull();
  });

  it('should open create modal with a specific boardId', () => {
    act(() => {
      useTaskUiStore.getState().openCreateModal('board-abc');
    });

    const state = useTaskUiStore.getState();
    expect(state.isCreateModalOpen).toBe(true);
    expect(state.createModalDefaultBoardId).toBe('board-abc');
  });

  it('should close create modal and clear boardId', () => {
    act(() => {
      useTaskUiStore.getState().openCreateModal('board-abc');
    });
    expect(useTaskUiStore.getState().isCreateModalOpen).toBe(true);

    act(() => {
      useTaskUiStore.getState().closeCreateModal();
    });

    const state = useTaskUiStore.getState();
    expect(state.isCreateModalOpen).toBe(false);
    expect(state.createModalDefaultBoardId).toBeNull();
  });

  it('should not affect create modal when opening/closing drawer', () => {
    act(() => {
      useTaskUiStore.getState().openCreateModal('board-xyz');
    });

    act(() => {
      useTaskUiStore.getState().openDrawer(mockTask);
    });

    // Create modal state should be unchanged
    expect(useTaskUiStore.getState().isCreateModalOpen).toBe(true);
    expect(useTaskUiStore.getState().createModalDefaultBoardId).toBe('board-xyz');

    act(() => {
      useTaskUiStore.getState().closeDrawer();
    });
    expect(useTaskUiStore.getState().isCreateModalOpen).toBe(true);
  });
});
