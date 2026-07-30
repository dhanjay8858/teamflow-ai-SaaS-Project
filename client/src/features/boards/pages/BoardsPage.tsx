import React, { useState, useEffect } from 'react';
import { useBoards } from '../hooks/useBoards';
import { useProjects } from '../../projects/hooks/useProjects';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { BoardCard } from '../components/BoardCard';
import { CreateBoardModal } from '../components/CreateBoardModal';
import { EditBoardModal } from '../components/EditBoardModal';
import { Board } from '../../../types/board';
import { Kanban, Plus, Layers, FolderKanban } from 'lucide-react';

export const BoardsPage: React.FC = () => {
  const { currentWorkspace } = useWorkspaceStore();
  const { useWorkspaceProjects } = useProjects();
  const { useProjectBoards, archiveBoard, reorderBoards } = useBoards();

  const { data: projectsData } = useWorkspaceProjects();
  const projects = projectsData?.data?.projects || [];

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projects, selectedProjectId]);

  const { data: boardsData, isLoading } = useProjectBoards(selectedProjectId);
  const boards = boardsData?.data?.boards || [];

  const handleMoveColumn = async (currentIndex: number, direction: 'left' | 'right') => {
    if (!selectedProjectId || boards.length < 2) return;
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= boards.length) return;

    // Swap positions
    const reorderedList = [...boards];
    const temp = reorderedList[currentIndex];
    reorderedList[currentIndex] = reorderedList[targetIndex];
    reorderedList[targetIndex] = temp;

    const payload = reorderedList.map((b, idx) => ({
      boardId: b._id,
      position: idx + 1,
    }));

    try {
      await reorderBoards({ projectId: selectedProjectId, boards: payload });
    } catch (err: any) {
      alert(err.message || 'Failed to reorder columns');
    }
  };

  const handleArchive = async (board: Board) => {
    if (!selectedProjectId) return;
    if (window.confirm(`Are you sure you want to archive board column '${board.name}'?`)) {
      try {
        await archiveBoard({ boardId: board._id, projectId: selectedProjectId });
      } catch (err: any) {
        alert(err.message || 'Failed to archive board');
      }
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>No workspace selected.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <CreateBoardModal isOpen={isCreateOpen} projectId={selectedProjectId} onClose={() => setIsCreateOpen(false)} />
      <EditBoardModal isOpen={!!editingBoard} board={editingBoard} projectId={selectedProjectId} onClose={() => setEditingBoard(null)} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Kanban className="h-6 w-6 text-indigo-400" />
            <span>Kanban Workflow Boards</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Define custom workflow stages and board column ordering inside <strong className="text-purple-400">{currentWorkspace.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Project Selector Dropdown */}
          <div className="flex items-center gap-2 bg-[#0e0e12] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
            <FolderKanban className="h-4 w-4 text-indigo-400 shrink-0" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id} className="bg-zinc-950 text-white">
                  {p.name} (/{p.slug})
                </option>
              ))}
            </select>
          </div>

          <button
            disabled={!selectedProjectId}
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-40 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>New Board Column</span>
          </button>
        </div>
      </div>

      {/* Boards Column Layout */}
      {!selectedProjectId ? (
        <div className="p-12 text-center text-xs text-zinc-500 bg-[#0e0e12] border border-zinc-800 rounded-2xl space-y-2">
          <FolderKanban className="h-8 w-8 text-zinc-600 mx-auto" />
          <p>Please select a project to manage its Kanban workflow boards.</p>
        </div>
      ) : isLoading ? (
        <div className="p-12 text-center text-xs text-zinc-500 bg-[#0e0e12] border border-zinc-800 rounded-2xl">
          Loading Kanban boards...
        </div>
      ) : boards.length === 0 ? (
        <div className="p-12 text-center text-xs text-zinc-500 bg-[#0e0e12] border border-zinc-800 rounded-2xl space-y-3">
          <Layers className="h-8 w-8 text-zinc-600 mx-auto" />
          <p>No boards configured for this project yet.</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create First Board Column</span>
          </button>
        </div>
      ) : (
        <div className="flex items-stretch gap-4 overflow-x-auto pb-6">
          {boards.map((board, idx) => (
            <BoardCard
              key={board._id}
              board={board}
              isFirst={idx === 0}
              isLast={idx === boards.length - 1}
              onMoveLeft={() => handleMoveColumn(idx, 'left')}
              onMoveRight={() => handleMoveColumn(idx, 'right')}
              onEdit={(b) => setEditingBoard(b)}
              onArchive={(b) => handleArchive(b)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
