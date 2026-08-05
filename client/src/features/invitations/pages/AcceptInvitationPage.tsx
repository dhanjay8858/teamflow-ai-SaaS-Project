import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useInvitations } from '../hooks/useInvitations';
import { useAuthStore } from '../../../stores/auth.store';
import { Layers, Building2, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

export const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const { isAuthenticated } = useAuthStore();
  const { useValidateToken, acceptInvitation, isAccepting } = useInvitations();
  const { data, isLoading, isError } = useValidateToken(token);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const invitation = data?.data?.invitation;

  const handleAccept = async () => {
    if (!isAuthenticated) {
      navigate(`/auth/register?email=${encodeURIComponent(invitation?.email || '')}&redirect=${encodeURIComponent(`/invitations/accept?token=${token}`)}`);
      return;
    }

    try {
      const result = await acceptInvitation(token);
      const data = result?.data as any;
      if (data?.organizationSlug && data?.workspaceSlug) {
        navigate(`/org/${data.organizationSlug}/workspace/${data.workspaceSlug}/projects`, { replace: true });
      } else {
        navigate('/org', { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept invitation');
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="bg-[#0e0e12] border border-zinc-800 rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />

        {isLoading ? (
          <div className="py-12 space-y-3">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Verifying secure invitation token...</p>
          </div>
        ) : isError || !invitation ? (
          <div className="py-8 space-y-4">
            <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 w-fit mx-auto">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Invalid or Expired Invitation</h2>
            <p className="text-xs text-zinc-400">This invitation token is invalid, cancelled, or has expired.</p>
            <Link to="/" className="inline-flex px-4 py-2 rounded-xl bg-zinc-900 text-xs font-medium text-zinc-300">
              Return Home
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 mx-auto shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Layers className="h-8 w-8 text-indigo-400" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Workspace Invitation
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Join {invitation.workspace.name}
              </h2>
              <p className="text-xs text-zinc-400">
                You have been invited by <strong className="text-white">{invitation.invitedBy.name}</strong> to join the workspace as a <strong className="text-indigo-400">{invitation.role}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs space-y-2 text-left">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Organization</span>
                <span className="text-white font-medium flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-indigo-400" />{invitation.organization.name}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Workspace</span>
                <span className="text-white font-medium">{invitation.workspace.name}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Invited Email</span>
                <span className="text-indigo-300 font-medium">{invitation.email}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isAccepting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Activating Membership...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Accept Invitation & Join</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/auth/register?email=${encodeURIComponent(invitation.email)}&redirect=${encodeURIComponent(`/invitations/accept?token=${token}`)}`)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Create Account to Join</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate(`/auth/login?email=${encodeURIComponent(invitation.email)}&redirect=${encodeURIComponent(`/invitations/accept?token=${token}`)}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all"
                >
                  Already have an account? Sign In
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
