import React, { useState } from 'react';
import {
  Sparkles,
  Activity,
  Rocket,
  ShieldAlert,
  Users,
  FileText,
  UserCheck,
  RefreshCw,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { apiClient } from '../../../config/api.client';
import { AuthApiResponse } from '../../../types/auth';
import { MarkdownRenderer } from '../../ai/components/MarkdownRenderer';

interface ProjectAiPanelProps {
  projectId: string;
  workspaceId: string;
  projectName: string;
}

export type ProjectAiAction =
  | 'PROJECT_HEALTH'
  | 'SPRINT_PLANNING'
  | 'RELEASE_READINESS'
  | 'TEAM_WORKLOAD'
  | 'EXECUTIVE_REPORT'
  | 'STANDUP_GENERATION';

export const ProjectAiPanel: React.FC<ProjectAiPanelProps> = ({
  projectId,
  workspaceId,
  projectName,
}) => {
  const [activeAction, setActiveAction] = useState<ProjectAiAction>('PROJECT_HEALTH');
  const [reportType, setReportType] = useState<string>('Weekly');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleExecute = async (action: ProjectAiAction, rType = reportType) => {
    setActiveAction(action);
    setIsLoading(true);
    setResult('');

    try {
      const res = await apiClient.post<
        unknown,
        AuthApiResponse<{ result: string }>
      >('/ai/project-assistant/action', {
        workspaceId,
        projectId,
        action,
        reportType: rType,
      });

      if (res.success && res.data) {
        setResult(res.data.result);
      }
    } catch (err: any) {
      setResult(`Failed to generate Project Intelligence: ${err?.message || 'Error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_${activeAction.toLowerCase()}.md`;
    a.click();
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-zinc-950 border border-purple-500/20 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Project & Sprint Intelligence
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Groq / Gemini Hybrid
              </span>
            </h3>
            <p className="text-xs text-zinc-400">AI analysis for {projectName}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          onClick={() => handleExecute('PROJECT_HEALTH')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
            activeAction === 'PROJECT_HEALTH'
              ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
          }`}
        >
          <Activity size={14} className="text-emerald-400 shrink-0" />
          <span>Project Health</span>
        </button>

        <button
          onClick={() => handleExecute('SPRINT_PLANNING')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
            activeAction === 'SPRINT_PLANNING'
              ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
          }`}
        >
          <Rocket size={14} className="text-indigo-400 shrink-0" />
          <span>Sprint Planning</span>
        </button>

        <button
          onClick={() => handleExecute('RELEASE_READINESS')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
            activeAction === 'RELEASE_READINESS'
              ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
          }`}
        >
          <ShieldAlert size={14} className="text-amber-400 shrink-0" />
          <span>Release Readiness</span>
        </button>

        <button
          onClick={() => handleExecute('TEAM_WORKLOAD')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
            activeAction === 'TEAM_WORKLOAD'
              ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
          }`}
        >
          <Users size={14} className="text-blue-400 shrink-0" />
          <span>Team Workload</span>
        </button>

        <button
          onClick={() => handleExecute('EXECUTIVE_REPORT')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
            activeAction === 'EXECUTIVE_REPORT'
              ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
          }`}
        >
          <FileText size={14} className="text-purple-400 shrink-0" />
          <span>Executive Report</span>
        </button>

        <button
          onClick={() => handleExecute('STANDUP_GENERATION')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
            activeAction === 'STANDUP_GENERATION'
              ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
          }`}
        >
          <UserCheck size={14} className="text-teal-400 shrink-0" />
          <span>Daily Standup</span>
        </button>
      </div>

      {/* Report Options Selector */}
      {activeAction === 'EXECUTIVE_REPORT' && (
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="text-zinc-400 font-medium">Report Type:</span>
          {['Weekly', 'Sprint', 'Project Summary', 'Release Summary'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setReportType(type);
                handleExecute('EXECUTIVE_REPORT', type);
              }}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                reportType === type
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2 animate-pulse">
          <RefreshCw size={14} className="animate-spin text-purple-400" />
          <span>Analyzing project telemetry & generating intelligence for {activeAction}…</span>
        </div>
      )}

      {/* Output Content Container */}
      {result && !isLoading && (
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {activeAction} Output ({reportType})
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
                title="Copy Markdown"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
                title="Download Markdown Report"
              >
                <Download size={13} />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          <MarkdownRenderer content={result} />
        </div>
      )}
    </div>
  );
};
