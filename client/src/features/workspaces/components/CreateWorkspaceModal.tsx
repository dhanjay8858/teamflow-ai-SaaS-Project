import React, { useState } from 'react';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { useOrganizationStore } from '../../../stores/organization.store';
import { X, Layers, AlertCircle, RefreshCw } from 'lucide-react';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { currentOrganization } = useOrganizationStore();
  const { createWorkspace, isCreatingWorkspace, createWorkspaceError } = useWorkspaces();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const [clientError, setClientError] = useState<string | null>(null);

  if (!isOpen || !currentOrganization) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData({ ...formData, name: val, slug: generatedSlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!formData.name.trim()) {
      setClientError('Workspace name is required');
      return;
    }
    if (!formData.slug.trim()) {
      setClientError('Workspace slug is required');
      return;
    }

    try {
      await createWorkspace({
        organizationId: currentOrganization._id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
      });
      onClose();
      setFormData({ name: '', slug: '', description: '' });
    } catch {
      // Error handled by createWorkspaceError
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0e0e12] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-white">Create New Workspace</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {(clientError || createWorkspaceError) && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{clientError || createWorkspaceError?.message || 'Failed to create workspace'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-medium text-zinc-300">Workspace Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Engineering / Frontend / Core Platform"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-zinc-300">Workspace Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="engineering"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-zinc-300">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this workspace's purpose"
              rows={3}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingWorkspace}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isCreatingWorkspace ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>Create Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
