import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 max-w-[200px] animate-pulse">
      <Sparkles size={14} className="text-indigo-400 animate-spin" />
      <span className="text-xs text-zinc-400 font-medium">Analyzing workspace…</span>
    </div>
  );
};

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export const SUGGESTED_QUESTIONS = [
  'What changed today in this workspace?',
  'Summarize the current workspace status.',
  'What tasks are overdue or urgent?',
  'Show recent activity and comments.',
  'Which projects have active work?',
];

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ onSelect }) => {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-semibold text-zinc-400 tracking-wide uppercase flex items-center gap-1.5">
        <MessageSquare size={12} className="text-indigo-400" />
        Suggested Prompts
      </span>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(q)}
            className="text-left text-xs px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 transition-all duration-150"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};
