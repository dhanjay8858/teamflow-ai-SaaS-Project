import React, { useState, useEffect } from 'react';
import { useProjects } from '../../projects/hooks/useProjects';
import { useBoards } from '../../boards/hooks/useBoards';
import { useTasks } from '../hooks/useTasks';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { useTaskUiStore } from '../../../stores/taskUi.store';
import { TaskCard } from '../components/TaskCard';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { TaskDetailsDrawer } from '../components/TaskDetailsDrawer';
import { RecentlyViewedWidget } from '../components/RecentlyViewedWidget';
import { TaskStatus, TaskPriority } from '../../../types/task';
import { CheckSquare, Plus, Search, FolderKanban, Layers } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { currentWorkspace } = useWorkspaceStore();
  const { openCreateModal } = useTaskUiStore();
  const { useWorkspaceProjects } = useProjects();
  const { useProjectBoards } = useBoards();
  const { useProjectTasks } = useTasks();

  const { data: projectsData } = useWorkspaceProjects();
  const projects = projectsData?.data?.projects || [];

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projects, selectedProjectId]);

  const { data: boardsData } = useProjectBoards(selectedProjectId);
  const boards = boardsData?.data?.boards || [];

  const { data: tasksData, isLoading } = useProjectTasks(selectedProjectId, searchQuery);
  const tasks = tasksData?.data?.tasks || [];

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  if (!currentWorkspace) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>No workspace selected.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <CreateTaskModal boardId={boards[0]?._id || ''} />
      <TaskDetailsDrawer boards={boards} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <CheckSquare className="h-6 w-6 text-indigo-400" />
            <span>Task Workspaces</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Central task collaboration unit inside <strong className="text-purple-400">{currentWorkspace.name}</strong>
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
            disabled={!selectedProjectId || boards.length === 0}
            onClick={() => openCreateModal()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-40 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Recently Viewed Tasks Widget */}
      <RecentlyViewedWidget />

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, ID (PROJ-1)..."
              className="w-full bg-[#0e0e12] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0e0e12] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-indigo-400 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value={TaskStatus.BACKLOG}>BACKLOG</option>
            <option value={TaskStatus.TODO}>TODO</option>
            <option value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</option>
            <option value={TaskStatus.IN_REVIEW}>IN_REVIEW</option>
            <option value={TaskStatus.DONE}>DONE</option>
            <option value={TaskStatus.CANCELLED}>CANCELLED</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#0e0e12] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-purple-400 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value={TaskPriority.LOW}>LOW</option>
            <option value={TaskPriority.MEDIUM}>MEDIUM</option>
            <option value={TaskPriority.HIGH}>HIGH</option>
            <option value={TaskPriority.URGENT}>URGENT</option>
          </select>
        </div>
      </div>

      {/* Board Column Kanban Task Grid */}
      {!selectedProjectId ? (
        <div className="p-12 text-center text-xs text-zinc-500 bg-[#0e0e12] border border-zinc-800 rounded-2xl">
          Please select a project to view tasks.
        </div>
      ) : isLoading ? (
        <div className="p-12 text-center text-xs text-zinc-500 bg-[#0e0e12] border border-zinc-800 rounded-2xl">
          Loading tasks...
        </div>
      ) : boards.length === 0 ? (
        <div className="p-12 text-center text-xs text-zinc-500 bg-[#0e0e12] border border-zinc-800 rounded-2xl space-y-2">
          <Layers className="h-8 w-8 text-zinc-600 mx-auto" />
          <p>No boards found for this project. Please create a board first.</p>
        </div>
      ) : (
        <div className="flex items-start gap-4 overflow-x-auto pb-6">
          {boards.map((board) => {
            const boardTasks = filteredTasks.filter((t) => (t.board._id || t.board) === board._id);
            return (
              <div key={board._id} className="w-80 bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-4 shrink-0 space-y-3 flex flex-col max-h-[75vh]">
                {/* Board Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: board.color || '#6366f1' }} />
                    <h3 className="text-sm font-bold text-white">{board.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-[10px] text-zinc-400 font-mono">
                      {boardTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openCreateModal(board._id)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Column Tasks */}
                <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[100px]">
                  {boardTasks.length === 0 ? (
                    <div className="p-6 text-center text-[11px] text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                      No tasks in column
                    </div>
                  ) : (
                    boardTasks.map((task) => <TaskCard key={task._id} task={task} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
