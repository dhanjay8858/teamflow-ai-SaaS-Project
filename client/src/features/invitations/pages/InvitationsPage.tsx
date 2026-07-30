import React, { useState } from 'react';
import { useInvitations } from '../hooks/useInvitations';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { Mail, Plus, RotateCw, XCircle, Clock, Shield } from 'lucide-react';

export const InvitationsPage: React.FC = () => {
  const { currentWorkspace } = useWorkspaceStore();
  const { usePendingInvitations, resendInvitation, isResending, cancelInvitation, isCancelling } = useInvitations();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [resendStatusMsg, setResendStatusMsg] = useState<string | null>(null);

  const { data, isLoading } = usePendingInvitations(currentWorkspace?._id);
  const invitations = data?.data?.invitations || [];

  const handleResend = async (id: string, email: string) => {
    try {
      const response = await resendInvitation(id);
      if (response?.data?.token) {
        setResendStatusMsg(`New invitation link generated for ${email}`);
        setTimeout(() => setResendStatusMsg(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to resend invitation');
    }
  };

  const handleCancel = async (id: string, email: string) => {
    if (window.confirm(`Are you sure you want to cancel the invitation for ${email}?`)) {
      try {
        await cancelInvitation(id);
      } catch (err: any) {
        alert(err.message || 'Failed to cancel invitation');
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
    <div className="max-w-5xl mx-auto space-y-6">
      <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Pending Workspace Invitations</h1>
          <p className="text-xs text-zinc-400">
            Active invitations for <strong className="text-purple-400">{currentWorkspace.name}</strong>
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {resendStatusMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          {resendStatusMsg}
        </div>
      )}

      {/* Invitations Table */}
      <div className="bg-[#0e0e12]/80 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500">Loading invitations...</div>
        ) : invitations.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
            <Mail className="h-8 w-8 text-zinc-600 mx-auto" />
            <p>No pending invitations found for this workspace.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {invitations.map((inv) => (
              <div key={inv._id} className="p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-zinc-900/40 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm truncate">{inv.email}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {inv.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-indigo-400" />Role: {inv.role}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-amber-400" />Expires: {new Date(inv.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleResend(inv._id, inv.email)}
                    disabled={isResending}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>Resend</span>
                  </button>

                  <button
                    onClick={() => handleCancel(inv._id, inv.email)}
                    disabled={isCancelling}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
