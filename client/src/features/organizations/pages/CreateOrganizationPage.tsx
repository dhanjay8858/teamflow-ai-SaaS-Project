import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizations } from '../hooks/useOrganizations';
import { Building2, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export const CreateOrganizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { createOrganization, isCreatingOrg, createOrgError } = useOrganizations();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const [clientError, setClientError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData({ ...formData, name: val, slug: generatedSlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!formData.name.trim()) {
      setClientError('Organization name is required');
      return;
    }
    if (!formData.slug.trim()) {
      setClientError('Organization slug is required');
      return;
    }

    try {
      await createOrganization(formData);
      navigate('/org/settings');
    } catch {
      // Error handled by createOrgError
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 space-y-6">
      <div className="bg-[#0e0e12]/80 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

        <div className="space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create Organization</h2>
          <p className="text-sm text-zinc-400">
            Set up your multi-tenant team space on TeamFlow AI
          </p>
        </div>

        {(clientError || createOrgError) && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{clientError || createOrgError?.message || 'Organization creation failed.'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-medium text-zinc-300">Organization Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Acme Corp / Vercel Labs"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-zinc-300">Organization Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="acme-corp"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-zinc-300">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Engineering collaboration space"
              rows={3}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isCreatingOrg}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isCreatingOrg ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Creating Organization...</span>
              </>
            ) : (
              <>
                <span>Create Organization & Continue</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
