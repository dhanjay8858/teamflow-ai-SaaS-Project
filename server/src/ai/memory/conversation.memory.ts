import { ConversationMemory, ChatMessage } from '../types/memory.types.js';

export class ConversationMemoryManager implements ConversationMemory {
  private history: ChatMessage[] = [];

  constructor(initialMessages: ChatMessage[] = []) {
    this.history = [...initialMessages];
  }

  public addMessage(message: ChatMessage): void {
    const tokenEstimate = Math.ceil(message.content.length / 4);
    this.history.push({
      ...message,
      timestamp: message.timestamp || new Date(),
      tokenCount: message.tokenCount || tokenEstimate,
    });
  }

  public getHistory(): ChatMessage[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }

  public getTokenCount(): number {
    return this.history.reduce((sum, msg) => sum + (msg.tokenCount || Math.ceil(msg.content.length / 4)), 0);
  }

  public trimToBudget(maxTokens: number): ChatMessage[] {
    let currentTokens = this.getTokenCount();
    while (currentTokens > maxTokens && this.history.length > 1) {
      // Remove oldest non-system message
      const indexToRemove = this.history.findIndex((m) => m.role !== 'system');
      if (indexToRemove >= 0) {
        const removed = this.history.splice(indexToRemove, 1)[0];
        currentTokens -= removed.tokenCount || Math.ceil(removed.content.length / 4);
      } else {
        break;
      }
    }
    return this.getHistory();
  }
}
