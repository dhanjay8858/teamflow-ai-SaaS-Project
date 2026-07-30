import React, { useState } from 'react';
import { useInvitations } from '../hooks/useInvitations';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { MembershipRole } from '../../../types/organization';
import { X, Mail, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { currentWorkspace } = useWorkspaceStore();
  const { createInvitation, isCreatingInvitation, createInvitationError } = useInvitations();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MembershipRole>(MembershipRole.MEMBER);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  if (!isOpen || !currentWorkspace) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    setCreatedLink(null);

    if (!email.trim()) {
      setClientError('Please enter an email address');
      return;
    }

    try {
      const response = await createInvitation({
        workspaceId: currentWorkspace._id,
        email: email.trim(),
        role,
      });

      if (response?.data?.invitationLink) {
        setCreatedLink(response.data.invitationLink);
      }
    } catch {
      // Error handled by createInvitationError
    }
  };

  const handleCopy = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0e0e12] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Invite Team Member</h3>
              <p className="text-xs text-zinc-400">To <span className="text-purple-400 font-medium">{currentWorkspace.name}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {(clientError || createInvitationError) && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{clientError || createInvitationError?.message || 'Failed to send invitation'}</span>
          </div>
        )}

        {createdLink ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <Check className="h-4 w-4" />
              <span>Invitation Created Successfully!</span>
            </div>
            <p className="text-xs text-zinc-400">Share this secure invitation link with the recipient:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={createdLink}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <button
              onClick={() => {
                setCreatedLink(null);
                setEmail('');
              }}
              className="w-full text-center text-xs text-indigo-400 hover:underline pt-1"
            >
              Invite another user
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-medium text-zinc-300">Member Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-zinc-300">Workspace Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as MembershipRole)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value={MembershipRole.MEMBER}>MEMBER (Standard Workspace Access)</option>
                  <option value={MembershipRole.ADMIN}>ADMIN (Workspace Management)</option>
                  <option value={MembershipRole.OWNER}>OWNER (Full Workspace Control)</option>
                </select>
              </div>
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
                disabled={isCreatingInvitation}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isCreatingInvitation ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                <span>Generate Invitation</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
