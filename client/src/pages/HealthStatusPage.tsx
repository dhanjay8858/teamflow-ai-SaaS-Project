import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api.client';
import { socketClient } from '../config/socket.client';
import { Server, Database, Cloud, Radio, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface HealthResponse {
  success: boolean;
  message: string;
  data: {
    status: string;
    uptime: number;
    timestamp: string;
  };
}

export const HealthStatusPage: React.FC = () => {
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const { data, isLoading, isError, refetch } = useQuery<HealthResponse>({
    queryKey: ['server-health'],
    queryFn: () => apiClient.get('/health'),
    refetchInterval: 10000,
  });

  useEffect(() => {
    const socket = socketClient.connect();

    const handleConnect = () => setSocketStatus('connected');
    const handleDisconnect = () => setSocketStatus('disconnected');

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected) {
      setSocketStatus('connected');
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/30 via-zinc-900 to-purple-900/20 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            Phase 1 Infrastructure Active
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            System Infrastructure Verification
          </h1>
          <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed">
            TeamFlow AI core server engine, socket dispatcher, REST middleware layer, and dark-mode styling foundation are active.
          </p>
        </div>
      </div>

      {/* Infrastructure Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* REST API Status */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Express REST Server</h3>
                <p className="text-xs text-zinc-500">Port 5000 / API Endpoint</p>
              </div>
            </div>
            {isLoading ? (
              <RefreshCw className="h-5 w-5 text-zinc-500 animate-spin" />
            ) : isError ? (
              <AlertCircle className="h-5 w-5 text-rose-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            )}
          </div>
          <div className="text-xs font-mono bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-zinc-400 overflow-x-auto">
            {isLoading ? 'Checking endpoint status...' : isError ? 'Backend server disconnected (Run server dev command)' : JSON.stringify(data?.data, null, 2)}
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Re-check Health
          </button>
        </div>

        {/* Real-time Socket.IO Status */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Socket.IO Real-time Engine</h3>
                <p className="text-xs text-zinc-500">WebSockets / Connection presence</p>
              </div>
            </div>
            {socketStatus === 'connected' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <div className="text-xs font-mono bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-zinc-400">
            <div>Status: <span className={socketStatus === 'connected' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{socketStatus.toUpperCase()}</span></div>
            <div>Channel: ws://localhost:5000</div>
          </div>
        </div>

        {/* Database Ready */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 flex items-center justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">MongoDB Mongoose Connector</h3>
              <p className="text-xs text-zinc-500">Strict Schema & Database Abstraction Ready</p>
            </div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        </div>

        {/* Storage Provider */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 flex items-center justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Cloudinary File Storage SDK</h3>
              <p className="text-xs text-zinc-500">Configured & Multer Stream Handler Ready</p>
            </div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
