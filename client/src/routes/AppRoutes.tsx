import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { AuthLayout } from '../features/auth/layouts/AuthLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ProfilePage } from '../features/auth/pages/ProfilePage';
import { OrganizationLayout } from '../features/organizations/layouts/OrganizationLayout';
import { CreateOrganizationPage } from '../features/organizations/pages/CreateOrganizationPage';
import { OrganizationSettingsPage } from '../features/organizations/pages/OrganizationSettingsPage';
import { WorkspaceSettingsPage } from '../features/workspaces/pages/WorkspaceSettingsPage';
import { MembersPage } from '../features/memberships/pages/MembersPage';
import { InvitationsPage } from '../features/invitations/pages/InvitationsPage';
import { AcceptInvitationPage } from '../features/invitations/pages/AcceptInvitationPage';
import { DeclineInvitationPage } from '../features/invitations/pages/DeclineInvitationPage';
import { ActivityTimelinePage } from '../features/activity/pages/ActivityTimelinePage';
import { ProjectsPage } from '../features/projects/pages/ProjectsPage';
import { ProjectDetailsPage } from '../features/projects/pages/ProjectDetailsPage';
import { BoardsPage } from '../features/boards/pages/BoardsPage';
import { TasksPage } from '../features/tasks/pages/TasksPage';
import { AIHub } from '../features/agents/components/AIHub';
import { HealthStatusPage } from '../pages/HealthStatusPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { useWorkspaceContext } from '../features/context/hooks/useWorkspaceContext';
import { useOrganizationStore } from '../stores/organization.store';
import { useWorkspaceStore } from '../stores/workspace.store';
import { useAuthStore } from '../stores/auth.store';
import { RefreshCw } from 'lucide-react';


// Smart root: logged-in users → /org (dashboard), others → health page
const RootRedirector: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuthStore();
  const [showSlowMessage, setShowSlowMessage] = React.useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInitializing) {
      timer = setTimeout(() => setShowSlowMessage(true), 5000);
    }
    return () => clearTimeout(timer);
  }, [isInitializing]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          {showSlowMessage && (
            <p className="text-xs text-zinc-400 max-w-xs text-center animate-in fade-in duration-500">
              Waking up the server...<br/>
              <span className="text-[10px] text-zinc-500">This can take up to 50 seconds on the free tier.</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/org" replace />;
  return <HealthStatusPage />;
};


const OrgContextRedirector: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganizationStore();
  const { currentWorkspace } = useWorkspaceStore();
  const { useGetContext } = useWorkspaceContext();
  const { isPending, isError } = useGetContext();

  useEffect(() => {
    if (currentOrganization && currentWorkspace) {
      navigate(`/org/${currentOrganization.slug}/workspace/${currentWorkspace.slug}/projects`, { replace: true });
    } else if (isError) {
      navigate('/org/create', { replace: true });
    }
  }, [currentOrganization, currentWorkspace, isError, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-medium tracking-wide">Restoring active workspace context...</p>
        </div>
      </div>
    );
  }

  return null;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Unauthenticated Auth Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Public Invitation Action Routes */}
      <Route path="/invitations/accept" element={<AcceptInvitationPage />} />
      <Route path="/invitations/decline" element={<DeclineInvitationPage />} />

      {/* Main Public & Health Shell */}
      <Route path="/" element={<RootLayout />}>
        <Route index element={<RootRedirector />} />

        {/* Protected User Profile Route */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<RootRedirector />} />
      </Route>

      {/* Protected Organization & Workspace Multi-Tenant Core */}
      <Route element={<ProtectedRoute />}>
        <Route path="/org/create" element={<CreateOrganizationPage />} />
        <Route path="/org" element={<OrgContextRedirector />} />

        <Route path="/org/:organizationSlug/workspace/:workspaceSlug" element={<OrganizationLayout />}>
          <Route index element={<Navigate to="projects" replace />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="boards" element={<BoardsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="agents" element={<AIHub />} />
          <Route path="settings" element={<OrganizationSettingsPage />} />
          <Route path="workspaces" element={<WorkspaceSettingsPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="invitations" element={<InvitationsPage />} />
          <Route path="activity" element={<ActivityTimelinePage />} />
        </Route>
      </Route>
    </Routes>
  );
};
