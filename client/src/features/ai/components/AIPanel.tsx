import React, { useState } from 'react';
import { X, Sparkles, Sidebar, RotateCcw } from 'lucide-react';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { useWorkspaceAi } from '../hooks/useWorkspaceAi';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';
import { ConversationSidebar } from './ConversationSidebar';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ isOpen, onClose }) => {
  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?._id || '';

  const {
    messages,
    isLoading,
    askQuestion,
    clearConversation,
  } = useWorkspaceAi(workspaceId);

  const [showSidebar, setShowSidebar] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col transition-all duration-200 animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Toggle Sidebar"
          >
            <Sidebar size={16} />
          </button>
          <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              Workspace AI Assistant
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            </h2>
            <p className="text-[10px] text-zinc-400 truncate max-w-[200px]">
              {currentWorkspace?.name || 'Active Workspace'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearConversation}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Clear Chat"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Close Panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <ConversationSidebar
            onNewChat={clearConversation}
            activeChatId="default"
          />
        )}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSelectPrompt={(prompt) => askQuestion(prompt)}
            onRegenerate={(content) => askQuestion(content)}
          />
          <ChatInput
            onSend={(prompt) => askQuestion(prompt)}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
