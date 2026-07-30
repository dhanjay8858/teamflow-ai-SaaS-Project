import React, { useRef, useEffect } from 'react';
import { AIChatMessage } from '../../../types/ai';
import { ChatMessage } from './ChatMessage';
import { EmptyState } from './EmptyState';
import { TypingIndicator } from './SuggestedQuestions';

interface ChatWindowProps {
  messages: AIChatMessage[];
  isLoading: boolean;
  onSelectPrompt: (prompt: string) => void;
  onRegenerate?: (content: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onSelectPrompt,
  onRegenerate,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
        <EmptyState onSelectPrompt={onSelectPrompt} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onRegenerate={onRegenerate}
        />
      ))}

      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
};
