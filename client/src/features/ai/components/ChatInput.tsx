import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Square, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (prompt: string) => void;
  isLoading: boolean;
  onStop?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading, onStop }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!prompt.trim() || isLoading) return;
    onSend(prompt.trim());
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="relative p-3 bg-zinc-950 border-t border-zinc-800/80">
      <div className="flex items-end gap-2 bg-zinc-900 border border-zinc-800 focus-within:border-indigo-500/60 rounded-2xl px-3 py-2 transition-all">
        <Sparkles size={16} className="text-indigo-400 shrink-0 mb-1.5" />
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask TeamFlow AI about tasks, projects, or work..."
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 resize-none outline-none max-h-28 py-0.5 leading-relaxed"
        />

        {isLoading ? (
          <button
            onClick={onStop}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors shrink-0"
            title="Stop generation"
          >
            <Square size={14} className="fill-current" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!prompt.trim()}
            className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shrink-0 shadow-md shadow-indigo-600/20"
            title="Send prompt (Enter)"
          >
            <Send size={14} />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] text-zinc-500">
        <span>Use <kbd className="px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono">Shift + Enter</kbd> for new line</span>
        <span>Groq → Gemini → Ollama active</span>
      </div>
    </div>
  );
};
