import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useOrganizations } from '../hooks/useOrganizations';
import { useWorkspaces } from '../../workspaces/hooks/useWorkspaces';
import { useWorkspaceContext } from '../../context/hooks/useWorkspaceContext';
import { useOrganizationStore } from '../../../stores/organization.store';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { useAuthStore } from '../../../stores/auth.store';
import { CreateWorkspaceModal } from '../../workspaces/components/CreateWorkspaceModal';
import { AIButton } from '../../ai/components/AIButton';
import { AIPanel } from '../../ai/components/AIPanel';
import { NotificationBell } from '../../notifications/components/NotificationBell';
import {
  Building2,
  Layers,
  Users,
  Settings,
  Plus,
  ChevronDown,
  Kanban,
  MessageSquare,
  FolderKanban,
  CheckSquare,
  Calendar,
  Sparkles,
  User as UserIcon,
  LogOut,
  Mail,
  RefreshCw,
  History,
} from 'lucide-react';

export const OrganizationLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { organizationSlug, workspaceSlug } = useParams<{ organizationSlug: string; workspaceSlug: string }>();

  const { user, logout } = useAuthStore();
  const { currentOrganization, organizations } = useOrganizationStore();
  const { currentWorkspace, workspaces } = useWorkspaceStore();

  const { useUserOrganizations } = useOrganizations();
  const { useOrgWorkspaces } = useWorkspaces();
  const { switchWorkspaceContext, isSwitching } = useWorkspaceContext();

  useUserOrganizations();
  useOrgWorkspaces();

  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
  const [isWsMenuOpen, setIsWsMenuOpen] = useState(false);
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // URL Parameter Context Synchronization
  useEffect(() => {
    if (organizationSlug && workspaceSlug) {
      if (
        currentOrganization?.slug !== organizationSlug ||
        currentWorkspace?.slug !== workspaceSlug
      ) {
        switchWorkspaceContext({ organizationSlug, workspaceSlug }).catch(() => {
          // Fallback if URL slug is invalid
        });
      }
    }
  }, [organizationSlug, workspaceSlug]);

  const handleSelectOrganization = async (orgSlug: string) => {
    setIsOrgMenuOpen(false);
    const targetOrg = organizations.find((o) => o.slug === orgSlug);
    if (!targetOrg) return;

    const defaultWsSlug = 'general';
    try {
      await switchWorkspaceContext({ organizationSlug: orgSlug, workspaceSlug: defaultWsSlug });
      navigate(`/org/${orgSlug}/workspace/${defaultWsSlug}/settings`);
    } catch {
      // Ignore error
    }
  };

  const handleSelectWorkspace = async (wsSlug: string) => {
    setIsWsMenuOpen(false);
    if (!currentOrganization) return;

    try {
      await switchWorkspaceContext({
        organizationSlug: currentOrganization.slug,
        workspaceSlug: wsSlug,
      });
      navigate(`/org/${currentOrganization.slug}/workspace/${wsSlug}/settings`);
    } catch {
      // Ignore error
    }
  };

  const basePath = currentOrganization && currentWorkspace
    ? `/org/${currentOrganization.slug}/workspace/${currentWorkspace.slug}`
    : '/org/settings';

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex font-sans">
      <CreateWorkspaceModal isOpen={isCreateWsOpen} onClose={() => setIsCreateWsOpen(false)} />

      {/* Left Sidebar */}
      <aside className="w-64 border-r border-zinc-800/80 bg-[#0b0b0e] flex flex-col justify-between shrink-0">
        <div className="p-4 space-y-4">
          {/* Top Organization Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsOrgMenuOpen(!isOrgMenuOpen);
                setIsWsMenuOpen(false);
              }}
              disabled={isSwitching}
              className="w-full p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="h-7 w-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  {isSwitching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">
                    {currentOrganization?.name || 'Select Organization'}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">
                    {currentOrganization ? `/${currentOrganization.slug}` : 'no-org'}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
            </button>

            {/* Organization Dropdown */}
            {isOrgMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0e0e12] border border-zinc-800 rounded-xl p-1.5 shadow-2xl z-50 space-y-1 animate-in fade-in duration-150">
                <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Organizations ({organizations.length})
                </div>
                {organizations.map((org) => (
                  <button
                    key={org._id}
                    onClick={() => handleSelectOrganization(org.slug)}
                    className={`w-full p-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      currentOrganization?._id === org._id
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">/{org.slug}</span>
                  </button>
                ))}

                <button
                  onClick={() => {
                    setIsOrgMenuOpen(false);
                    navigate('/org/create');
                  }}
                  className="w-full p-2 rounded-lg text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-2 transition-colors border-t border-zinc-800/60 mt-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create New Organization</span>
                </button>
              </div>
            )}
          </div>

          {/* Workspace Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsWsMenuOpen(!isWsMenuOpen);
                setIsOrgMenuOpen(false);
              }}
              disabled={isSwitching}
              className="w-full p-2 rounded-lg bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800/80 flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <Layers className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span className="text-zinc-200 font-medium truncate">
                  {currentWorkspace?.name || 'General Workspace'}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            </button>

            {/* Workspace Dropdown */}
            {isWsMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0e0e12] border border-zinc-800 rounded-xl p-1.5 shadow-2xl z-50 space-y-1">
                <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Workspaces ({workspaces.length})
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws._id}
                    onClick={() => handleSelectWorkspace(ws.slug)}
                    className={`w-full p-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      currentWorkspace?._id === ws._id
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {ws.isDefault && <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Default</span>}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setIsWsMenuOpen(false);
                    setIsCreateWsOpen(true);
                  }}
                  className="w-full p-2 rounded-lg text-xs font-medium text-purple-400 hover:bg-purple-500/10 flex items-center gap-2 transition-colors border-t border-zinc-800/60 mt-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Workspace</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-6 pt-2">
            {/* Active Core Section */}
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Core Workspace</p>

              <Link
                to={`${basePath}/projects`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  location.pathname.includes('/projects')
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <FolderKanban className="h-4 w-4 text-indigo-400" />
                <span>Projects</span>
              </Link>

              <Link
                to={`${basePath}/boards`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  location.pathname.endsWith('/boards')
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Kanban className="h-4 w-4 text-sky-400" />
                <span>Kanban Boards</span>
              </Link>

              <Link
                to={`${basePath}/tasks`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  location.pathname.endsWith('/tasks')
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <CheckSquare className="h-4 w-4 text-purple-400" />
                <span>Tasks</span>
              </Link>

              <Link
                to={`${basePath}/agents`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  location.pathname.endsWith('/agents')
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Sparkles className="h-4 w-4 text-pink-400 animate-pulse" />
                <span className="flex items-center gap-1.5">
                  AI Agents Hub
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-mono">v12</span>
                </span>
              </Link>

              <Link
                to={`${basePath}/settings`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  location.pathname.endsWith('/settings') && !location.pathname.includes('/workspaces/')
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Settings className="h-4 w-4 text-indigo-400" />
                <span>Organization Settings</span>
              </Link>

              <Link
                to={`${basePath}/workspaces`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  location.pathname.endsWith('/workspaces')
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Layers className="h-4 w-4 text-purple-400" />
                <span>Workspaces Manager</span>
              </Link>

              <Link
                to={`${basePath}/members`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  location.pathname.endsWith('/members')
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Users className="h-4 w-4 text-emerald-400" />
                <span>Members & Roles</span>
              </Link>

              <Link
                to={`${basePath}/invitations`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  location.pathname.endsWith('/invitations')
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Mail className="h-4 w-4 text-sky-400" />
                <span>Pending Invitations</span>
              </Link>

              <Link
                to={`${basePath}/activity`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  location.pathname.endsWith('/activity')
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <History className="h-4 w-4 text-amber-400" />
                <span>Activity Timeline</span>
              </Link>
            </div>

            {/* Disabled Future Placeholders */}
            <div className="space-y-1 opacity-50 cursor-not-allowed">
              <p className="px-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Apps & Modules</p>

              <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-500">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat & Channels</span>
                </div>
                <span className="text-[9px] bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">Soon</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-500">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4" />
                  <span>Sprint Calendar</span>
                </div>
                <span className="text-[9px] bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">Soon</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-500">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>AI Assistant</span>
                </div>
                <span className="text-[9px] bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-[#09090c] flex items-center justify-between text-xs">
          <Link to="/profile" className="flex items-center gap-2.5 text-zinc-300 hover:text-white truncate">
            <div className="h-7 w-7 rounded-lg bg-indigo-600/30 overflow-hidden flex items-center justify-center border border-indigo-500/30 shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-3.5 w-3.5 text-indigo-400" />
              )}
            </div>
            <span className="font-medium truncate">{user?.name}</span>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Outlet Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>

      {/* Floating Workspace AI Assistant */}
      <AIButton onClick={() => setIsAiOpen(!isAiOpen)} isOpen={isAiOpen} />
      <AIPanel isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};
