import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';

interface CommentComposerProps {
  taskId: string;
  onSubmit: (markdown: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  compact?: boolean;
}

export const CommentComposer: React.FC<CommentComposerProps> = ({
  taskId: _taskId,
  onSubmit,
  placeholder = 'Write a comment… (Markdown supported)',
  disabled = false,
  autoFocus = false,
  compact = false,
}) => {
  const [markdown, setMarkdown] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = markdown.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      setMarkdown('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (err: any) {
      // Let parent handle error display
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`;
  };

  const canSubmit = markdown.trim().length > 0 && !isSubmitting && !disabled;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className={`relative bg-zinc-950 border rounded-xl overflow-hidden transition-colors
        ${compact ? 'border-zinc-800' : 'border-zinc-700'}
        focus-within:border-indigo-500/70
      `}>
        <textarea
          ref={textareaRef}
          value={markdown}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          autoFocus={autoFocus}
          rows={compact ? 2 : 3}
          aria-label="Comment text"
          className={`
            w-full bg-transparent text-zinc-200 placeholder-zinc-600 resize-none outline-none font-mono
            ${compact ? 'text-xs px-3 py-2' : 'text-sm px-4 py-3'}
          `}
          style={{ minHeight: compact ? '60px' : '80px' }}
        />
        <div className={`flex items-center justify-between px-3 py-1.5 border-t border-zinc-800/80 bg-zinc-950/50`}>
          <span className="text-[10px] text-zinc-600">
            Markdown · <kbd className="font-mono">Ctrl+Enter</kbd> to send
          </span>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium
              transition-all duration-150
              ${canSubmit
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }
            `}
            aria-label="Submit comment"
          >
            <Send size={11} />
            <span>{isSubmitting ? 'Sending…' : 'Send'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
