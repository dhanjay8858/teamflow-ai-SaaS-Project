import React from 'react';
import { Sparkles, Bot, AlertTriangle, RefreshCw } from 'lucide-react';
import { SuggestedQuestions } from './SuggestedQuestions';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-6">
      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
        <Bot size={24} className="text-white" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
          Workspace AI Assistant
          <Sparkles size={14} className="text-indigo-400" />
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Ask anything about your tasks, projects, comments, files, or team activity. Context is gathered securely using your workspace permissions.
        </p>
      </div>

      <div className="w-full text-left pt-2">
        <SuggestedQuestions onSelect={onSelectPrompt} />
      </div>
    </div>
  );
};

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-2">
      <div className="flex items-start gap-2">
        <AlertTriangle size={14} className="shrink-0 mt-0.5 text-rose-400" />
        <span className="leading-relaxed">{error}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold hover:underline"
        >
          <RefreshCw size={11} />
          <span>Try again</span>
        </button>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 p-4">
      <div className="h-4 w-1/3 bg-zinc-800 rounded animate-pulse" />
      <div className="h-12 w-full bg-zinc-900 rounded-xl animate-pulse" />
      <div className="h-20 w-3/4 bg-zinc-900 rounded-xl animate-pulse" />
    </div>
  );
};
