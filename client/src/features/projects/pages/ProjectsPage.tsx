import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { ProjectStatus } from '../../../types/project';
import { FolderKanban, Plus, Search, Layers } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { currentWorkspace } = useWorkspaceStore();
  const { useWorkspaceProjects } = useProjects();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading } = useWorkspaceProjects(selectedStatus === 'ARCHIVED');
  const projects = data?.data?.projects || [];

  const filteredProjects = projects.filter((proj) => {
    const matchesSearch = proj.name.toLowerCase().includes(search.toLowerCase()) || proj.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || (selectedStatus === 'ARCHIVED' ? proj.isArchived : proj.status === selectedStatus);
    return matchesSearch && matchesStatus;
  });

  const basePath = currentWorkspace ? `/org/${currentWorkspace.slug}/workspace/${currentWorkspace.slug}` : '';

  if (!currentWorkspace) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>No workspace selected.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FolderKanban className="h-6 w-6 text-indigo-400" />
            <span>Workspace Projects</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Collaboration units and project workspaces inside <strong className="text-purple-400">{currentWorkspace.name}</strong>
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
        {/* Status Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-[#0e0e12] border border-zinc-800 flex-wrap">
          {['ALL', ProjectStatus.ACTIVE, ProjectStatus.ON_HOLD, ProjectStatus.COMPLETED, ProjectStatus.ARCHIVED].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedStatus === st
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-[#0e0e12] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-zinc-500 bg-[#0e0e12] border border-zinc-800 rounded-2xl">
          Loading workspace projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center text-xs text-zinc-500 bg-[#0e0e12] border border-zinc-800 rounded-2xl space-y-3">
          <Layers className="h-8 w-8 text-zinc-600 mx-auto" />
          <p>No projects found matching your filters.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} basePath={basePath} />
          ))}
        </div>
      )}
    </div>
  );
};
