import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useInvitations } from '../hooks/useInvitations';
import { XCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export const DeclineInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const { declineInvitation, isDeclining } = useInvitations();
  const [isDeclined, setIsDeclined] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDecline = async () => {
    try {
      await declineInvitation(token);
      setIsDeclined(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to decline invitation');
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="bg-[#0e0e12] border border-zinc-800 rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 text-center">
        <div className="p-3.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 w-fit mx-auto">
          <XCircle className="h-8 w-8" />
        </div>

        {isDeclined ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              <span>Invitation Declined</span>
            </div>
            <p className="text-xs text-zinc-400">You have declined the workspace invitation.</p>
            <Link to="/" className="inline-flex px-4 py-2 rounded-xl bg-zinc-900 text-xs font-medium text-zinc-300">
              Return Home
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Decline Invitation?</h2>
            <p className="text-xs text-zinc-400">Are you sure you want to decline this workspace invitation?</p>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleDecline}
              disabled={isDeclining}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isDeclining ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              <span>Confirm Decline</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
