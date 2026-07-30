import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { RefreshCw } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-medium tracking-wide text-zinc-400">Verifying security session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};
