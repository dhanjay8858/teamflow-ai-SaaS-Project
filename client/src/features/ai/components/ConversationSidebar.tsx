import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';

interface ConversationSidebarProps {
  onNewChat: () => void;
  activeChatId?: string;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  onNewChat,
  activeChatId = 'default',
}) => {
  return (
    <div className="w-56 bg-zinc-950 border-r border-zinc-800/80 p-3 flex flex-col justify-between text-xs">
      <div className="space-y-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus size={14} />
          <span>New Chat</span>
        </button>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2">
            History
          </span>
          <div
            className={`flex items-center gap-2 p-2 rounded-xl border transition-colors cursor-pointer ${
              activeChatId === 'default'
                ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                : 'text-zinc-400 hover:bg-zinc-900/50 border-transparent'
            }`}
          >
            <MessageSquare size={13} className="text-indigo-400 shrink-0" />
            <span className="truncate">Current Session</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500 text-center">
        <span>Workspace AI v1.0</span>
      </div>
    </div>
  );
};
