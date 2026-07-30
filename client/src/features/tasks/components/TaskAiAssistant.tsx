import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  CheckSquare,
  ListTodo,
  TrendingUp,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { apiClient } from '../../../config/api.client';
import { AuthApiResponse } from '../../../types/auth';
import { MarkdownRenderer } from '../../ai/components/MarkdownRenderer';

interface TaskAiAssistantProps {
  taskId: string;
  workspaceId: string;
  onApplyDescription?: (newDescription: string) => void;
}

export type TaskAiAction =
  | 'IMPROVE_DESCRIPTION'
  | 'GENERATE_SUBTASKS'
  | 'GENERATE_ACCEPTANCE_CRITERIA'
  | 'ESTIMATE_COMPLEXITY'
  | 'ANALYZE_RISKS'
  | 'FIND_DUPLICATES'
  | 'SUGGEST_DEPENDENCIES'
  | 'SUMMARIZE_DISCUSSION'
  | 'GENERATE_TEST_CASES';

export const TaskAiAssistant: React.FC<TaskAiAssistantProps> = ({
  taskId,
  workspaceId,
  onApplyDescription,
}) => {
  const [activeAction, setActiveAction] = useState<TaskAiAction | null>(null);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleAction = async (action: TaskAiAction) => {
    setActiveAction(action);
    setIsLoading(true);
    setResult('');

    try {
      const res = await apiClient.post<
        unknown,
        AuthApiResponse<{ result: string }>
      >('/ai/task-assistant/action', {
        workspaceId,
        taskId,
        action,
      });

      if (res.success && res.data) {
        setResult(res.data.result);
      }
    } catch (err: any) {
      setResult(`Failed to execute AI action: ${err?.message || 'Error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-950 border border-indigo-500/20 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles size={13} />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">AI Task Assistant</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Groq / Gemini Hybrid</span>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        <button
          onClick={() => handleAction('IMPROVE_DESCRIPTION')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 transition-all text-left"
        >
          <FileText size={12} className="text-indigo-400 shrink-0" />
          <span className="truncate">Improve Desc</span>
        </button>

        <button
          onClick={() => handleAction('GENERATE_SUBTASKS')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 transition-all text-left"
        >
          <ListTodo size={12} className="text-purple-400 shrink-0" />
          <span className="truncate">Subtasks</span>
        </button>

        <button
          onClick={() => handleAction('GENERATE_ACCEPTANCE_CRITERIA')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 transition-all text-left"
        >
          <CheckSquare size={12} className="text-emerald-400 shrink-0" />
          <span className="truncate">Criteria</span>
        </button>

        <button
          onClick={() => handleAction('ESTIMATE_COMPLEXITY')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 transition-all text-left"
        >
          <TrendingUp size={12} className="text-amber-400 shrink-0" />
          <span className="truncate">Estimate</span>
        </button>

        <button
          onClick={() => handleAction('ANALYZE_RISKS')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 transition-all text-left"
        >
          <AlertTriangle size={12} className="text-rose-400 shrink-0" />
          <span className="truncate">Risks</span>
        </button>

        <button
          onClick={() => handleAction('SUMMARIZE_DISCUSSION')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 transition-all text-left"
        >
          <Zap size={12} className="text-blue-400 shrink-0" />
          <span className="truncate">Summarize</span>
        </button>
      </div>

      {/* Result Display Box */}
      {isLoading && (
        <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2 animate-pulse">
          <RefreshCw size={13} className="animate-spin text-indigo-400" />
          <span>Generating AI output for {activeAction}…</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              {activeAction} Output
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
              >
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onApplyDescription && activeAction === 'IMPROVE_DESCRIPTION' && (
                <button
                  onClick={() => onApplyDescription(result)}
                  className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white transition-all"
                >
                  Apply to Description
                </button>
              )}
            </div>
          </div>

          <MarkdownRenderer content={result} />
        </div>
      )}
    </div>
  );
};
