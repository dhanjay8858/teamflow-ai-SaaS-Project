export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  tokenCount?: number;
}

export interface ConversationMemory {
  addMessage(message: ChatMessage): void;
  getHistory(): ChatMessage[];
  clear(): void;
  getTokenCount(): number;
  trimToBudget(maxTokens: number): ChatMessage[];
}
