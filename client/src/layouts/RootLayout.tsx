import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { Layers, Activity, User as UserIcon, LogIn, ShieldCheck, Cpu } from 'lucide-react';
import { NotificationBell } from '../features/notifications/components/NotificationBell';
import { AIButton } from '../features/ai/components/AIButton';
import { AIPanel } from '../features/ai/components/AIPanel';

export const RootLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      {/* Top Header Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-[#0c0c0e]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            TeamFlow <span className="text-indigo-400 font-semibold">AI</span>
          </span>
          <span className="ml-2 px-2.5 py-0.5 text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
            Auth Module Ready
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-800">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>System Status: <strong className="text-emerald-400">Operational</strong></span>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link
                to="/profile"
                className="flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors text-white font-medium"
              >
                <div className="h-6 w-6 rounded-lg bg-indigo-600/30 overflow-hidden flex items-center justify-center border border-indigo-500/30">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-3.5 w-3.5 text-indigo-400" />
                  )}
                </div>
                <span>{user.name}</span>
              </Link>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-xl text-white font-medium shadow-md shadow-indigo-600/20 transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <Outlet />
      </main>

      {/* Workspace AI Assistant Floating Button & Panel */}
      {isAuthenticated && (
        <>
          <AIButton onClick={() => setIsAiOpen(!isAiOpen)} isOpen={isAiOpen} />
          <AIPanel isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 bg-[#09090b] py-4 px-6 text-center text-xs text-zinc-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
          <span>TeamFlow AI Core Engine Architecture</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-purple-400" />
          <span>Node.js + React + Socket.IO + Mongoose</span>
        </div>
      </footer>
    </div>
  );
};
