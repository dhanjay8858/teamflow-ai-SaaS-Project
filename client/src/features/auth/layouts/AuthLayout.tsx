import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layers, Sparkles, Shield, Zap } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Subtle Background Radial Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Layers className="h-5.5 w-5.5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            TeamFlow <span className="text-indigo-400 font-semibold">AI</span>
          </span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer Feature Badges */}
      <footer className="px-8 py-6 flex flex-wrap items-center justify-center gap-8 text-xs text-zinc-500 border-t border-zinc-900/60 relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>AI Task & Sprint Automation</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
          <span>Enterprise JWT & Role Security</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-purple-400" />
          <span>Real-Time Socket Presence</span>
        </div>
      </footer>
    </div>
  );
};
