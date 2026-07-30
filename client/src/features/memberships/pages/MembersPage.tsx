import React from 'react';
import { useMemberships } from '../hooks/useMemberships';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { MembershipRole } from '../../../types/organization';
import { Users, User as UserIcon, Trash2, AtSign, Mail } from 'lucide-react';

export const MembersPage: React.FC = () => {
  const { currentWorkspace } = useWorkspaceStore();
  const { useWorkspaceMembers, updateRole, removeMember } = useMemberships();

  const { data, isLoading } = useWorkspaceMembers(currentWorkspace?._id);
  const members = data?.data?.members || [];

  const handleRoleChange = async (membershipId: string, role: MembershipRole) => {
    try {
      await updateRole({ membershipId, role });
    } catch (err: any) {
      alert(err.message || 'Failed to update member role');
    }
  };

  const handleRemove = async (membershipId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from this workspace?`)) {
      try {
        await removeMember(membershipId);
      } catch (err: any) {
        alert(err.message || 'Failed to remove member');
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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Workspace Members & Roles</h1>
          <p className="text-xs text-zinc-400">
            Active team members in <strong className="text-purple-400">{currentWorkspace.name}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-xl text-xs text-zinc-300">
          <Users className="h-4 w-4 text-emerald-400" />
          <span>{members.length} Active Members</span>
        </div>
      </div>

      {/* Members Table / List */}
      <div className="bg-[#0e0e12]/80 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500">Loading workspace members...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">No active members found.</div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {members.map((member) => (
              <div key={member._id} className="p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-zinc-900/40 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                    {member.user.avatar ? (
                      <img src={member.user.avatar} alt={member.user.name} className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-indigo-400" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm truncate">{member.user.name}</h4>
                      <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                        <AtSign className="h-3 w-3" />
                        {member.user.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-zinc-500" />{member.user.email}</span>
                      <span>•</span>
                      <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions & Role Select */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member._id, e.target.value as MembershipRole)}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-indigo-400 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value={MembershipRole.OWNER}>OWNER</option>
                      <option value={MembershipRole.ADMIN}>ADMIN</option>
                      <option value={MembershipRole.MEMBER}>MEMBER</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleRemove(member._id, member.user.name)}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 border border-zinc-800 transition-colors"
                    title="Remove Member"
                  >
                    <Trash2 className="h-4 w-4" />
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
