import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectStatus, ProjectVisibility } from '../../../types/project';
import { FolderKanban, Calendar, Lock, Globe, User as UserIcon } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  basePath: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, basePath }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case ProjectStatus.ON_HOLD:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case ProjectStatus.COMPLETED:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case ProjectStatus.ARCHIVED:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div
      onClick={() => navigate(`${basePath}/projects/${project._id}`)}
      className="bg-[#0e0e12] border border-zinc-800/90 hover:border-zinc-700/90 rounded-2xl p-5 shadow-xl transition-all cursor-pointer group space-y-4 relative overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: project.color || '#6366f1' }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
            style={{ backgroundColor: `${project.color || '#6366f1'}20`, color: project.color || '#6366f1' }}
          >
            <FolderKanban className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
              {project.name}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono">/{project.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px]">
        {project.description || 'No description provided for this project.'}
      </p>

      {/* Footer Info */}
      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          {project.visibility === ProjectVisibility.PRIVATE ? (
            <span className="flex items-center gap-1 text-[11px] text-amber-400">
              <Lock className="h-3 w-3" /> Private
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
              <Globe className="h-3 w-3 text-indigo-400" /> Workspace
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {project.targetDate && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
              <Calendar className="h-3 w-3 text-purple-400" />
              {new Date(project.targetDate).toLocaleDateString()}
            </span>
          )}

          <div className="flex items-center gap-1">
            <div className="h-5 w-5 rounded-full bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center">
              {project.createdBy.avatar ? (
                <img src={project.createdBy.avatar} alt={project.createdBy.name} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-3 w-3 text-zinc-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
