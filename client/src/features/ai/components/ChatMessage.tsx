import React, { useState } from 'react';
import { Bot, User, Copy, Check, RotateCcw } from 'lucide-react';
import { AIChatMessage } from '../../../types/ai';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CitationCard } from './CitationCard';
import { ProviderBadge, TokenUsageIndicator } from './ProviderBadge';
import { ErrorState } from './EmptyState';

interface ChatMessageProps {
  message: AIChatMessage;
  onRegenerate?: (content: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-2xl transition-colors ${
        isUser
          ? 'bg-zinc-900/40 border border-zinc-800/40 ml-6'
          : 'bg-zinc-950/80 border border-indigo-500/20 mr-2 shadow-sm'
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 border ${
          isUser
            ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
            : 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400'
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-zinc-300">
            {isUser ? 'You' : 'TeamFlow AI'}
          </span>
          {!isUser && message.metrics && (
            <ProviderBadge providerName={message.metrics.selectedProvider} />
          )}
        </div>

        {message.error ? (
          <ErrorState
            error={message.error}
            onRetry={onRegenerate ? () => onRegenerate(message.content) : undefined}
          />
        ) : (
          <MarkdownRenderer content={message.content} />
        )}

        {/* Citations section */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="pt-2 border-t border-zinc-800/60 space-y-1.5">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Referenced Context ({message.citations.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.citations.map((citation) => (
                <CitationCard key={citation.id} citation={citation} />
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!isUser && !message.error && (
          <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
            <TokenUsageIndicator metrics={message.metrics} />

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                title="Copy response"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              {onRegenerate && (
                <button
                  onClick={() => onRegenerate(message.content)}
                  className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                  title="Regenerate"
                >
                  <RotateCcw size={12} />
                  <span>Retry</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
