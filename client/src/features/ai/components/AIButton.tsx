import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface AIButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export const AIButton: React.FC<AIButtonProps> = ({ onClick, isOpen }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick]);

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-xl transition-all duration-200 ${
        isOpen
          ? 'bg-zinc-800 border border-zinc-700 text-zinc-300'
          : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:scale-105 text-white shadow-indigo-500/25'
      }`}
      title="Ask Workspace AI (Ctrl+K)"
    >
      <Sparkles size={16} className="text-white animate-pulse" />
      <span className="text-xs font-bold tracking-wide">Ask AI</span>
      <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/20 rounded text-white">
        ⌘K
      </kbd>
    </button>
  );
};
