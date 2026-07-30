import React, { useState } from 'react';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';
import { Layers, Plus, Save, Trash2, CheckCircle2, AlertCircle, RefreshCw, Lock, Globe } from 'lucide-react';
import { WorkspaceVisibility } from '../../../types/organization';

export const WorkspaceSettingsPage: React.FC = () => {
  const { currentWorkspace, workspaces, setCurrentWorkspace } = useWorkspaceStore();
  const { updateWorkspace, isUpdatingWorkspace, archiveWorkspace, isArchivingWorkspace } = useWorkspaces();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: currentWorkspace?.name || '',
    description: currentWorkspace?.description || '',
    visibility: currentWorkspace?.visibility || WorkspaceVisibility.INTERNAL,
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!currentWorkspace) return;

    try {
      await updateWorkspace({
        id: currentWorkspace._id,
        name: formData.name,
        description: formData.description,
      });
      setSuccessMsg('Workspace updated successfully');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update workspace');
    }
  };

  const handleArchive = async () => {
    if (!currentWorkspace) return;
    if (currentWorkspace.isDefault) {
      alert('Cannot archive the default workspace.');
      return;
    }

    if (window.confirm(`Are you sure you want to archive "${currentWorkspace.name}"?`)) {
      try {
        await archiveWorkspace(currentWorkspace._id);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to archive workspace');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <CreateWorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Workspaces Manager</h1>
          <p className="text-xs text-zinc-400">Switch active workspace, edit workspace options, or add new workspaces</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-2 transition-colors shadow-lg shadow-purple-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Workspaces List Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Available Workspaces ({workspaces.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws._id}
              onClick={() => {
                setCurrentWorkspace(ws);
                setFormData({
                  name: ws.name,
                  description: ws.description || '',
                  visibility: ws.visibility,
                });
              }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                currentWorkspace?._id === ws._id
                  ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30'
                  : 'bg-[#0e0e12]/60 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm">{ws.name}</h4>
                      {ws.isDefault && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">/{ws.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                  {ws.visibility === WorkspaceVisibility.PRIVATE ? (
                    <Lock className="h-3 w-3 text-amber-400" />
                  ) : (
                    <Globe className="h-3 w-3 text-emerald-400" />
                  )}
                  <span>{ws.visibility}</span>
                </div>
              </div>

              {ws.description && <p className="text-xs text-zinc-400 line-clamp-2">{ws.description}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Form for Active Workspace */}
      {currentWorkspace && (
        <form onSubmit={handleUpdate} className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-purple-400" />
            <h3 className="text-base font-semibold text-white">Active Workspace Settings ({currentWorkspace.name})</h3>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-medium text-zinc-300">Workspace Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-zinc-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={isUpdatingWorkspace}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isUpdatingWorkspace ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Workspace Details</span>
            </button>

            {!currentWorkspace.isDefault && (
              <button
                type="button"
                onClick={handleArchive}
                disabled={isArchivingWorkspace}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isArchivingWorkspace ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>Archive Workspace</span>
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
