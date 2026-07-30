import React, { useState } from 'react';
import { useOrganizationStore } from '../../../stores/organization.store';
import { useOrganizations } from '../hooks/useOrganizations';
import { Building2, Save, Trash2, CheckCircle2, AlertCircle, RefreshCw, Layers, Users } from 'lucide-react';

export const OrganizationSettingsPage: React.FC = () => {
  const { currentOrganization } = useOrganizationStore();
  const { updateOrganization, isUpdatingOrg, archiveOrganization, isArchivingOrg } = useOrganizations();

  const [formData, setFormData] = useState({
    name: currentOrganization?.name || '',
    description: currentOrganization?.description || '',
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!currentOrganization) {
    return (
      <div className="p-8 text-center text-zinc-400 space-y-4">
        <p>No organization selected.</p>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateOrganization({
        id: currentOrganization._id,
        name: formData.name,
        description: formData.description,
      });
      setSuccessMsg('Organization settings saved');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update organization');
    }
  };

  const handleArchive = async () => {
    if (window.confirm(`Are you sure you want to archive "${currentOrganization.name}"?`)) {
      try {
        await archiveOrganization(currentOrganization._id);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to archive organization');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Organization Settings</h1>
          <p className="text-xs text-zinc-400">Manage tenant metadata, workspaces, and workspace count</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            /{currentOrganization.slug}
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Active Workspaces</p>
              <h4 className="text-xl font-bold text-white">{currentOrganization.workspaceCount}</h4>
            </div>
          </div>
        </div>

        <div className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Organization Members</p>
              <h4 className="text-xl font-bold text-white">{currentOrganization.membersCount}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Update Form */}
      <form onSubmit={handleUpdate} className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2.5">
          <Building2 className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-semibold text-white">General Information</h3>
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
            <label className="font-medium text-zinc-300">Organization Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-zinc-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isUpdatingOrg}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isUpdatingOrg ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Changes</span>
        </button>
      </form>

      {/* Danger Zone */}
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-rose-400">Danger Zone</h3>
          <p className="text-xs text-zinc-400">Archiving will hide this organization and its workspaces.</p>
        </div>

        <button
          onClick={handleArchive}
          disabled={isArchivingOrg}
          className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isArchivingOrg ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          <span>Archive Organization</span>
        </button>
      </div>
    </div>
  );
};
