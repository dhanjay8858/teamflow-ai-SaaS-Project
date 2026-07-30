import { create } from 'zustand';
import { Task } from '../types/task';

interface TaskUiState {
  selectedTask: Task | null;
  isDrawerOpen: boolean;
  isCreateModalOpen: boolean;
  createModalDefaultBoardId: string | null;

  setSelectedTask: (task: Task | null) => void;
  openDrawer: (task: Task) => void;
  closeDrawer: () => void;
  openCreateModal: (boardId?: string) => void;
  closeCreateModal: () => void;
}

export const useTaskUiStore = create<TaskUiState>((set) => ({
  selectedTask: null,
  isDrawerOpen: false,
  isCreateModalOpen: false,
  createModalDefaultBoardId: null,

  setSelectedTask: (task) => set({ selectedTask: task }),
  openDrawer: (task) => set({ selectedTask: task, isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false, selectedTask: null }),
  openCreateModal: (boardId) => set({ isCreateModalOpen: true, createModalDefaultBoardId: boardId || null }),
  closeCreateModal: () => set({ isCreateModalOpen: false, createModalDefaultBoardId: null }),
}));
