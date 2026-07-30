import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useMemberships } from '../../memberships/hooks/useMemberships';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { ProjectStatus, ProjectMemberRole } from '../../../types/project';
import { FolderKanban, Users, UserPlus, Trash2, Calendar, Lock, Globe, Archive, ArrowLeft, User as UserIcon } from 'lucide-react';

export const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaceStore();

  const {
    useProjectDetails,
    useProjectMembers,
    updateProject,
    archiveProject,
    addProjectMember,
    updateProjectRole,
    removeProjectMember,
  } = useProjects();

  const { useWorkspaceMembers } = useMemberships();
  const { data: wsMembersData } = useWorkspaceMembers(currentWorkspace?._id);
  const workspaceMembers = wsMembersData?.data?.members || [];

  const { data: projData, isLoading } = useProjectDetails(projectId);
  const { data: membersData } = useProjectMembers(projectId);

  const project = projData?.data?.project;
  const projectMembers = membersData?.data?.members || [];

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<ProjectMemberRole>(ProjectMemberRole.CONTRIBUTOR);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return;
    try {
      await updateProject({ projectId: project._id, payload: { status: newStatus } });
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleArchive = async () => {
    if (!project) return;
    if (window.confirm(`Are you sure you want to archive project '${project.name}'?`)) {
      try {
        await archiveProject(project._id);
        navigate(-1);
      } catch (err: any) {
        alert(err.message || 'Failed to archive project');
      }
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !selectedUserId) return;

    try {
      await addProjectMember({ projectId: project._id, userId: selectedUserId, role: selectedRole });
      setIsAddMemberOpen(false);
      setSelectedUserId('');
    } catch (err: any) {
      alert(err.message || 'Failed to add project member');
    }
  };

  const handleRoleChange = async (memberId: string, role: ProjectMemberRole) => {
    if (!project) return;
    try {
      await updateProjectRole({ projectId: project._id, memberId, role });
    } catch (err: any) {
      alert(err.message || 'Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId: string, userName: string) => {
    if (!project) return;
    if (window.confirm(`Are you sure you want to remove ${userName} from this project?`)) {
      try {
        await removeProjectMember({ projectId: project._id, memberId });
      } catch (err: any) {
        alert(err.message || 'Failed to remove member');
      }
    }
  };

  if (isLoading || !project) {
    return (
      <div className="p-12 text-center text-xs text-zinc-500">
        Loading project details...
      </div>
    );
  }

  // Filter out workspace members who are already in the project
  const availableWsMembers = workspaceMembers.filter(
    (wm) => !projectMembers.some((pm) => pm.user._id === wm.user._id)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Projects</span>
      </button>

      {/* Project Banner Header */}
      <div className="bg-[#0e0e12] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: project.color || '#6366f1' }} />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
              style={{ backgroundColor: `${project.color || '#6366f1'}25`, color: project.color || '#6366f1' }}
            >
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <span className="text-xs font-mono text-indigo-400">/{project.slug}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{project.description || 'No description provided.'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-indigo-400 focus:outline-none cursor-pointer"
            >
              <option value={ProjectStatus.ACTIVE}>ACTIVE</option>
              <option value={ProjectStatus.ON_HOLD}>ON_HOLD</option>
              <option value={ProjectStatus.COMPLETED}>COMPLETED</option>
              <option value={ProjectStatus.ARCHIVED}>ARCHIVED</option>
            </select>

            <button
              onClick={handleArchive}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
              title="Archive Project"
            >
              <Archive className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-6 text-xs text-zinc-400 flex-wrap">
          <span className="flex items-center gap-1">
            {project.visibility === 'PRIVATE' ? <Lock className="h-3.5 w-3.5 text-amber-400" /> : <Globe className="h-3.5 w-3.5 text-indigo-400" />}
            {project.visibility} Visibility
          </span>

          {project.targetDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-purple-400" />
              Target: {new Date(project.targetDate).toLocaleDateString()}
            </span>
          )}

          <span className="flex items-center gap-1">
            <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
            Created by {project.createdBy.name}
          </span>
        </div>
      </div>

      {/* Project Members Section */}
      <div className="bg-[#0e0e12]/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Project Members ({projectMembers.length})</h3>
          </div>

          <button
            onClick={() => setIsAddMemberOpen(!isAddMemberOpen)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Member</span>
          </button>
        </div>

        {/* Add Member Form */}
        {isAddMemberOpen && (
          <form onSubmit={handleAddMember} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3 text-xs flex-wrap">
            <select
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
            >
              <option value="">Select Workspace Member...</option>
              {availableWsMembers.map((wm) => (
                <option key={wm.user._id} value={wm.user._id}>
                  {wm.user.name} ({wm.user.email})
                </option>
              ))}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as ProjectMemberRole)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-indigo-400 focus:outline-none"
            >
              <option value={ProjectMemberRole.CONTRIBUTOR}>CONTRIBUTOR</option>
              <option value={ProjectMemberRole.MANAGER}>MANAGER</option>
              <option value={ProjectMemberRole.OWNER}>OWNER</option>
              <option value={ProjectMemberRole.VIEWER}>VIEWER</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
            >
              Confirm Add
            </button>
          </form>
        )}

        {/* Members List */}
        <div className="divide-y divide-zinc-800/60">
          {projectMembers.map((member) => (
            <div key={member._id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center">
                  {member.user.avatar ? (
                    <img src={member.user.avatar} alt={member.user.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-indigo-400" />
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-white text-sm">{member.user.name}</h4>
                  <p className="text-xs text-zinc-400">{member.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member._id, e.target.value as ProjectMemberRole)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-indigo-400 focus:outline-none cursor-pointer"
                >
                  <option value={ProjectMemberRole.OWNER}>OWNER</option>
                  <option value={ProjectMemberRole.MANAGER}>MANAGER</option>
                  <option value={ProjectMemberRole.CONTRIBUTOR}>CONTRIBUTOR</option>
                  <option value={ProjectMemberRole.VIEWER}>VIEWER</option>
                </select>

                <button
                  onClick={() => handleRemoveMember(member._id, member.user.name)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
